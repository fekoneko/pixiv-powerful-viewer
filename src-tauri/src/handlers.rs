use std::io;
use std::path::{Path, PathBuf, MAIN_SEPARATOR};
use std::sync::{Arc, Mutex};
use std::u64;
use std::vec;
use tauri::State;
use tokio::fs;

use crate::Pids;

#[derive(serde::Serialize)]
#[allow(non_snake_case)]
pub struct Work {
    path: String,
    relativePath: String,
    title: String,
    userName: String,
    assets: Vec<ImageAsset>,

    id: Option<u64>,
    userId: Option<u64>,
    url: Option<String>,
    imageUrl: Option<String>,
    thumbnailUrl: Option<String>,
    ageRestriction: Option<String>,
    ai: Option<bool>,
    description: Option<String>,
    tags: Option<Vec<String>>,
    dimensions: Option<ImageDimensions>,
    bookmarks: Option<u64>,
    uploadTime: Option<String>,
}

#[derive(serde::Serialize)]
pub struct ImageAsset {
    name: String,
    path: String,
    dimensions: ImageDimensions,
}

#[derive(serde::Serialize)]
pub struct ImageDimensions {
    width: usize,
    height: usize,
}

#[tauri::command]
pub async fn read_collection(
    collection_path: String,
    pids: State<'_, Pids>,
) -> Result<(Vec<Work>, Vec<String>), String> {
    let pid = pids.read_collection_pid.clone();
    *pid.lock().unwrap() += 1;

    let collection_path = Path::new(&collection_path);
    if !collection_path.is_dir() {
        return Err(format!(
            "Collection is not a directory: {}",
            collection_path.display()
        ));
    }

    load_works(collection_path, pid.clone()).await
}

async fn load_works(
    collection_path: impl Into<PathBuf>,
    pid: Arc<Mutex<usize>>,
) -> Result<(Vec<Work>, Vec<String>), String> {
    let original_pid = *pid.lock().unwrap();

    async fn one_level(path: PathBuf, to_visit: &mut Vec<PathBuf>) -> io::Result<Vec<PathBuf>> {
        let mut dir = fs::read_dir(path).await?;
        let mut asset_group = vec![];

        while let Some(child) = dir.next_entry().await? {
            if child.metadata().await?.is_dir() {
                to_visit.push(child.path());
            } else {
                asset_group.push(child.path())
            }
        }

        Ok(asset_group)
    }

    let mut works: Vec<Work> = vec![];
    let mut errors: Vec<String> = vec![];
    let initial_path: PathBuf = collection_path.into();
    let mut to_visit: Vec<PathBuf> = vec![initial_path.clone()];

    while let Some(path) = to_visit.pop() {
        if *pid.lock().unwrap() != original_pid {
            return Err(format!(
                "Reading collection {} was cancelled",
                initial_path.display()
            ));
        }

        match one_level(path.clone(), &mut to_visit).await {
            Ok(asset_group) => {
                if asset_group.len() == 0 {
                    continue;
                }
                match parse_work(&asset_group, &path).await {
                    Ok(Some(mut work)) => {
                        work.relativePath = path
                            .strip_prefix(&initial_path)
                            .unwrap_or(Path::new(""))
                            .display()
                            .to_string();

                        // println!("Parsed work: '{}'", work.title);
                        works.push(work);
                    }
                    Ok(None) => (),
                    Err(error) => {
                        errors.push(format!("Failed to parse '{}': {error}", path.display()));
                    }
                }
            }
            Err(error) => errors.push(format!("Failed to read '{}': {error}", path.display())),
        };
    }
    Ok((works, errors))
}

async fn parse_work(asset_group: &Vec<PathBuf>, work_path: &Path) -> io::Result<Option<Work>> {
    let mut image_assets: Vec<&PathBuf> = vec![];
    let mut meta_asset: Option<&PathBuf> = None;

    for asset in asset_group.iter() {
        match asset.extension() {
            Some(extension) => match extension.to_str().unwrap_or_default() {
                "jpg" | "png" | "gif" | "webm" | "webp" | "apng" => image_assets.push(asset),
                "txt" => meta_asset = Some(asset),
                _ => (),
            },
            None => (),
        }
    }

    if image_assets.len() == 0 && meta_asset.is_none() {
        return Ok(None);
    }

    fn get_page_index(asset: &PathBuf) -> Option<u64> {
        let asset_name = asset
            .file_name()
            .unwrap_or_default()
            .to_str()
            .unwrap_or_default();
        if asset_name.len() == 0 {
            return None;
        }

        if let Some(left_index) = asset_name.rfind("(") {
            if let Some(right_index) = asset_name[left_index + 1..].find(")") {
                return asset_name[left_index + 1..left_index + right_index + 1]
                    .parse()
                    .ok();
            }
        }
        None
    }

    image_assets.sort_unstable_by_key(|asset| -> u64 { get_page_index(asset).unwrap_or(u64::MAX) });

    let mut work = get_required_metadata(work_path);

    if let Some(meta_asset) = meta_asset {
        add_metadata_from_file(meta_asset, &mut work).await?;
    }

    for asset in image_assets.iter() {
        add_asset(asset, &mut work);
    }

    Ok(Some(work))
}

fn get_required_metadata(work_path: &Path) -> Work {
    Work {
        path: String::from(work_path.to_str().unwrap_or_default()),
        relativePath: String::from(""),
        title: String::from(
            work_path
                .file_name()
                .unwrap_or_default()
                .to_str()
                .unwrap_or_default(),
        ),
        userName: String::from(
            work_path
                .iter()
                .nth_back(1)
                .unwrap_or_default()
                .to_str()
                .unwrap_or_default(),
        ),
        assets: vec![],

        id: None,
        userId: None,
        url: None,
        imageUrl: None,
        thumbnailUrl: None,
        ageRestriction: None,
        ai: None,
        description: None,
        tags: None,
        dimensions: None,
        bookmarks: None,
        uploadTime: None,
    }
}

async fn add_metadata_from_file(meta_asset: &PathBuf, work: &mut Work) -> io::Result<()> {
    let raw_metadata = fs::read_to_string(meta_asset).await?;
    let mut field_data: Vec<&str> = vec![];
    let mut field_name: Option<&str> = None;

    for raw_line in raw_metadata.lines() {
        match raw_line {
            "ID" | "URL" | "Original" | "Thumbnail" | "xRestrict" | "AI" | "User" | "UserID"
            | "Title" | "Description" | "Tags" | "Size" | "Bookmark" | "Date" => {
                if field_data.last().unwrap_or(&"").is_empty() {
                    if let Some(field_name) = field_name {
                        parse_field(field_name, &field_data, work);
                    }
                    field_data.clear();
                    field_name = Some(raw_line);
                }
            }
            _ => field_data.push(raw_line),
        }
    }
    if let Some(field_name) = field_name {
        parse_field(field_name, &field_data, work);
    }

    Ok(())
}

fn parse_field(field_name: &str, field_data: &Vec<&str>, work: &mut Work) {
    match field_name {
        "ID" => work.id = field_data.first().map(|value| value.parse().ok()).flatten(),
        "URL" => work.url = field_data.first().map(|value| String::from(*value)),
        "Original" => work.imageUrl = field_data.first().map(|value| String::from(*value)),
        "Thumbnail" => work.thumbnailUrl = field_data.first().map(|value| String::from(*value)),
        "xRestrict" => {
            work.ageRestriction = field_data
                .first()
                .map(|value| match *value {
                    "AllAges" => Some(String::from("all-ages")),
                    "R-18" => Some(String::from("r-18")),
                    "R-18G" => Some(String::from("r-18g")),
                    _ => None,
                })
                .flatten()
        }
        "AI" => {
            work.ai = field_data
                .first()
                .map(|value| match *value {
                    "Yes" => Some(true),
                    "No" => Some(false),
                    _ => None,
                })
                .flatten()
        }
        "User" => {
            if let Some(first_line) = field_data.first() {
                work.userName = String::from(*first_line)
            }
        }
        "UserID" => work.userId = field_data.first().map(|value| value.parse().ok()).flatten(),
        "Title" => {
            if let Some(first_line) = field_data.first() {
                work.title = String::from(*first_line)
            }
        }
        "Description" => work.description = Some(field_data[..field_data.len() - 1].join("\n")),
        "Tags" => {
            work.tags = Some(
                field_data[..field_data.len() - 1]
                    .iter()
                    .map(|value| {
                        let mut string = String::from(*value);
                        string.remove(0);
                        string
                    })
                    .collect(),
            )
        }
        "Size" => {
            if let Some(first_line) = field_data.first() {
                if let Some(splitted_line) = first_line.split_once(" x ") {
                    let width = splitted_line.0.parse().ok();
                    let height = splitted_line.1.parse().ok();

                    if width.is_some() && height.is_some() {
                        work.dimensions = Some(ImageDimensions {
                            width: width.unwrap(),
                            height: height.unwrap(),
                        })
                    }
                }
            }
        }
        "Bookmark" => work.bookmarks = field_data.first().map(|value| value.parse().ok()).flatten(),
        "Date" => work.uploadTime = field_data.first().map(|value| String::from(*value)),
        _ => (),
    }
}

fn add_asset(asset: &PathBuf, work: &mut Work) {
    if let Some(asset_name) = asset.file_name() {
        if let Ok(asset_dimensions) = imagesize::size(asset) {
            work.assets.push(ImageAsset {
                name: asset_name.to_string_lossy().to_string(),
                path: asset.to_string_lossy().to_string(),
                dimensions: ImageDimensions {
                    width: asset_dimensions.width,
                    height: asset_dimensions.height,
                },
            });
        };
    };
}

#[tauri::command]
pub async fn read_collection_list(
    collection_path: String,
    list_name: String,
) -> Option<Vec<String>> {
    let path = format!("{collection_path}{MAIN_SEPARATOR}.{list_name}");

    if let Ok(list_contents) = fs::read_to_string(path).await {
        let lines = list_contents.lines().map(|line| line.to_string()).collect();

        Some(lines)
    } else {
        None
    }
}

#[tauri::command]
pub async fn write_collection_list(
    collection_path: String,
    list_name: String,
    list: Vec<String>,
) -> Result<(), String> {
    let path = format!("{collection_path}{MAIN_SEPARATOR}.{list_name}");

    fs::write(path, list.join("\n"))
        .await
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub fn open(path_or_url: String) -> Result<(), String> {
    opener::open(path_or_url).map_err(|error| error.to_string())
}
