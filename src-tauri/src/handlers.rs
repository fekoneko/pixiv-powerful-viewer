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
        match parse_work(&asset_group) {
            Ok(work) => works.push(work),
            Err(error) => errors.push(format!(
                "Failed to parse work in '{}': {error}",
                path.display()
            )),
        }
    }
}

fn parse_work(asset_group: &Vec<PathBuf>) -> Result<Work, Box<dyn Error>> {
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

    Ok(parse_metadata(meta_asset)?)
}

fn parse_metadata(meta_asset: Option<&PathBuf>) -> io::Result<Work> {
    // TODO: make actual parsing
    Ok(Work {
        path: String::from("Path"),
        title: String::from("Title"),
        user_name: String::from("User"),

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
    })
}
