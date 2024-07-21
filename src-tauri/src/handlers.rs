use std::error::Error;
use std::fs;
use std::io;
use std::path::{Path, PathBuf};
use std::u64;
use std::vec;

use fancy_regex::Regex;

#[derive(serde::Serialize)]
pub struct Work {
    path: String,
    title: String,
    user_name: String,

    id: Option<u64>,
    user_id: Option<u64>,
    url: Option<String>,
    image_url: Option<String>,
    thumbnail_url: Option<String>,
    age_restriction: Option<String>,
    ai: Option<bool>,
    description: Option<String>,
    tags: Option<Vec<String>>,
    dimensions: Option<ImageDimensions>,
    bookmarks: Option<u64>,
    upload_time: Option<String>,
    assets: Option<Vec<String>>,
}

#[derive(serde::Serialize)]
pub struct ImageAsset {
    name: String,
    path: String,
    media_path: String,
    image_id: String,
    image_dimensions: ImageDimensions,
}

#[derive(serde::Serialize)]
pub struct ImageDimensions {
    width: u32,
    height: u32,
}

#[tauri::command]
pub fn read_collection(collection_path: &str) -> (Vec<Work>, Vec<String>) {
    let collection_path = Path::new(collection_path);
    if !collection_path.is_dir() {
        return (
            vec![],
            vec![format!(
                "Collection is not a directory: {}",
                collection_path.display()
            )],
        );
    }

    load_works(collection_path)
}

fn load_works(collection_path: &Path) -> (Vec<Work>, Vec<String>) {
    let mut works: Vec<Work> = vec![];
    let mut errors: Vec<String> = vec![];
    recursively_load_works(collection_path, &mut errors, &mut works);
    (works, errors)
}

fn recursively_load_works(path: &Path, errors: &mut Vec<String>, works: &mut Vec<Work>) {
    let mut asset_group: Vec<PathBuf> = vec![];

    (|| -> io::Result<()> {
        for entry_result in fs::read_dir(path)? {
            let entry = entry_result?;
            let entry_path = entry.path();

            if entry_path.is_dir() {
                recursively_load_works(&entry_path, errors, works);
            } else if entry_path.is_file() {
                asset_group.push(entry_path);
            }
        }
        Ok(())
    })()
    .unwrap_or_else(|error| {
        errors.push(format!("Failed to read '{}': {error}", path.display()));
    });

    if asset_group.len() > 0 {
        match parse_work(&asset_group, path) {
            Ok(work) => works.push(work),
            Err(error) => errors.push(format!(
                "Failed to parse work in '{}': {error}",
                path.display()
            )),
        }
    }
}

fn parse_work(asset_group: &Vec<PathBuf>, work_path: &Path) -> Result<Work, Box<dyn Error>> {
    // TODO: regex + io errors only
    let image_regex = Regex::new(r"\.jpg$|\.png$|\.gif$|\.webm$|\.webp$|\.apng$")?;
    let meta_regex = Regex::new(r"-meta\.txt$")?;
    let part_in_parentheses_regex = Regex::new(r"(?<=\()\d+(?=\)\.[^\.]*$)")?;

    let mut image_assets: Vec<&PathBuf> = vec![];
    let mut meta_asset: Option<&PathBuf> = None;

    fn get_asset_name(asset: &PathBuf) -> &str {
        asset
            .file_name()
            .unwrap_or_default()
            .to_str()
            .unwrap_or_default()
    }

    for asset in asset_group.iter() {
        let asset_name = get_asset_name(asset);

        if image_regex.is_match(asset_name).unwrap_or(false) {
            image_assets.push(asset);
        } else if meta_regex.is_match(asset_name).unwrap_or(false) {
            meta_asset = Some(asset);
        }
    }

    image_assets.sort_unstable_by_key(|asset| -> u64 {
        if let Some(page_index) = part_in_parentheses_regex
            .find(get_asset_name(*asset))
            .unwrap_or(None)
        {
            page_index.as_str().parse().unwrap_or(u64::MAX)
        } else {
            u64::MAX
        }
    });

    let mut work = get_required_metadata(work_path);

    if let Some(meta_asset) = meta_asset {
        add_metadata_from_file(meta_asset, &mut work)?;
    }
    Ok(work)
}

fn get_required_metadata(work_path: &Path) -> Work {
    Work {
        path: String::from(work_path.to_str().unwrap_or_default()),
        title: String::from(
            work_path
                .file_name()
                .unwrap_or_default()
                .to_str()
                .unwrap_or_default(),
        ),
        user_name: String::from(
            work_path
                .iter()
                .nth_back(1)
                .unwrap_or_default()
                .to_str()
                .unwrap_or_default(),
        ),

        id: None,
        user_id: None,
        url: None,
        image_url: None,
        thumbnail_url: None,
        age_restriction: None,
        ai: None,
        description: None,
        tags: None,
        dimensions: None,
        bookmarks: None,
        upload_time: None,
        assets: None,
    }
}

fn add_metadata_from_file(meta_asset: &PathBuf, work: &mut Work) -> io::Result<()> {
    let raw_metadata = fs::read_to_string(meta_asset)?;
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
            _ => {
                field_data.push(raw_line);
            }
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
        "Original" => work.image_url = field_data.first().map(|value| String::from(*value)),
        "Thumbnail" => work.thumbnail_url = field_data.first().map(|value| String::from(*value)),
        "xRestrict" => {
            work.age_restriction = field_data
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
                work.user_name = String::from(*first_line)
            }
        }
        "UserID" => work.user_id = field_data.first().map(|value| value.parse().ok()).flatten(),
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
        "Date" => work.upload_time = field_data.first().map(|value| String::from(*value)),
        _ => (),
    }
}
