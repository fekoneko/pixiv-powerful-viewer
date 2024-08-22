use crate::Pids;
use futures::future::join_all;
use futures::io;
use std::future::Future;
use std::path::{Path, PathBuf};
use std::sync::Arc;
use std::u64;
use std::vec;
use tauri::State;
use tokio::fs;
use tokio::sync::Mutex;

#[derive(serde::Serialize)]
#[allow(non_snake_case)]
pub struct Work {
    key: u64,
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
    *pid.lock().await += 1;

    let collection_path = Path::new(&collection_path);
    if !collection_path.is_dir() {
        return Err(format!(
            "Collection is not a directory: {}",
            collection_path.display()
        ));
    }

    load_works(collection_path.into(), pid).await
}

async fn load_works(
    collection_path: PathBuf,
    pid: Arc<Mutex<usize>>,
) -> Result<(Vec<Work>, Vec<String>), String> {
    let original_pid = *pid.lock().await;
    let works: Mutex<Vec<Work>> = Mutex::new(vec![]);
    let errors: Mutex<Vec<String>> = Mutex::new(vec![]);
    let work_key: Mutex<u64> = Mutex::new(0);

    for_each_asset_group(
        collection_path.clone(),
        collection_path,
        &works,
        &errors,
        &work_key,
        &|path, collection_path, asset_group, work_key| {
            let pid = pid.lock();
            async move {
                if *pid.await != original_pid {
                    return Err(String::from("Reading collection was cancelled"));
                }
                if asset_group.len() > 0 {
                    match parse_work(&asset_group, &path, work_key).await {
                        Ok(Some(mut work)) => {
                            work.relativePath = path
                                .strip_prefix(&collection_path)
                                .unwrap_or(Path::new(""))
                                .display()
                                .to_string();

                            return Ok(Some(work));
                        }
                        Ok(None) => (),
                        Err(error) => {
                            return Err(format!("Failed to parse '{}': {error}", path.display()));
                        }
                    }
                }
                Ok(None)
            }
        },
    )
    .await
    .map_err(|error| format!("Unexpected file system error: {error}"))?;

    Ok((works.into_inner(), errors.into_inner()))
}

async fn for_each_asset_group<C, F>(
    path: PathBuf,
    collection_path: PathBuf,
    works: &Mutex<Vec<Work>>,
    errors: &Mutex<Vec<String>>,
    work_key: &Mutex<u64>,
    callback: &C,
) -> io::Result<()>
where
    C: Fn(PathBuf, PathBuf, Vec<PathBuf>, u64) -> F + Sync,
    F: Future<Output = Result<Option<Work>, String>>,
{
    let mut dir_entires = fs::read_dir(path.clone()).await?;
    let mut asset_group: Vec<PathBuf> = vec![];
    let mut futures: Vec<_> = vec![];

    while let Some(entry) = dir_entires.next_entry().await? {
        if entry.metadata().await?.is_dir() {
            futures.push(for_each_asset_group(
                entry.path(),
                collection_path.clone(),
                works,
                errors,
                work_key,
                callback,
            ));
        } else {
            asset_group.push(entry.path());
        }
    }
    join_all(futures).await;

    let mut work_key = work_key.lock().await;
    match callback(path, collection_path, asset_group, *work_key).await {
        Ok(Some(work)) => {
            works.lock().await.push(work);
            *work_key += 1;
        }
        Ok(None) => (),
        Err(error) => errors.lock().await.push(error),
    }
    Ok(())
}

async fn parse_work(
    asset_group: &Vec<PathBuf>,
    work_path: &Path,
    work_key: u64,
) -> io::Result<Option<Work>> {
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

    let mut work = get_required_metadata(work_path, work_key);

    if let Some(meta_asset) = meta_asset {
        add_metadata_from_file(meta_asset, &mut work).await?;
    }

    for asset in image_assets.iter() {
        add_asset(asset, &mut work);
    }

    Ok(Some(work))
}

fn get_required_metadata(work_path: &Path, work_key: u64) -> Work {
    Work {
        key: work_key,
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
