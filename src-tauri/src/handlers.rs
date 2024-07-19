use std::fs;
use std::io;
use std::path::{Path, PathBuf};
use std::vec;

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
        let path_display = collection_path.display();
        return (
            vec![],
            vec![format!("Collection is not a directory: {path_display}")],
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
        let path_display = path.display();
        errors.push(format!("Failed to read '{path_display}': {error}"));
    });

    if asset_group.len() > 0 {
        if let Some(work) = parse_work(&asset_group, errors) {
            works.push(work);
        }
    }
}

fn parse_work(asset_group: &Vec<PathBuf>, errors: &mut Vec<String>) -> Option<Work> {
    // TODO: make actual parsing
    Some(Work {
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
