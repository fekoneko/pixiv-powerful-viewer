use crate::lib::{ImageAsset, ImageDimensions, Work};
use futures::io;
use std::path::{Path, PathBuf};
use std::u64;
use std::vec;
use tokio::fs;

pub async fn parse_work(
    collection_path: &Path,
    work_path: &Path,
    asset_paths: &Vec<PathBuf>,
    work_key: u64,
) -> io::Result<Option<Work>> {
    let mut image_paths: Vec<&PathBuf> = vec![];
    let mut metafile_path: Option<&PathBuf> = None;

    for path in asset_paths.iter() {
        if let Some(extension) = path.extension() {
            match extension.to_str().unwrap_or_default() {
                "jpg" | "png" | "gif" | "webm" | "webp" | "apng" => image_paths.push(path),
                "txt" => metafile_path = Some(path),
                _ => (),
            };
        }
    }

    if image_paths.len() == 0 && metafile_path.is_none() {
        return Ok(None);
    }

    fn get_page_index(path: &PathBuf) -> Option<u64> {
        let image_name = path
            .file_name()
            .unwrap_or_default()
            .to_str()
            .unwrap_or_default();
        if image_name.len() == 0 {
            return None;
        }

        if let Some(left_index) = image_name.rfind("(") {
            if let Some(right_index) = image_name[left_index + 1..].find(")") {
                return image_name[left_index + 1..left_index + right_index + 1]
                    .parse()
                    .ok();
            }
        }
        None
    }

    image_paths.sort_unstable_by_key(|path| -> u64 { get_page_index(path).unwrap_or(u64::MAX) });

    let mut work = get_required_metadata(collection_path, work_path, work_key);

    if let Some(metafile_path) = metafile_path {
        add_metadata_from_metafile(metafile_path, &mut work).await?;
    }

    for path in image_paths.iter() {
        add_image_asset(path, &mut work);
    }

    Ok(Some(work))
}

fn get_required_metadata(collection_path: &Path, work_path: &Path, work_key: u64) -> Work {
    Work {
        key: work_key,
        path: String::from(work_path.to_str().unwrap_or_default()),
        relativePath: work_path
            .strip_prefix(&collection_path)
            .unwrap_or(Path::new(""))
            .display()
            .to_string(),
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

async fn add_metadata_from_metafile(metafile_path: &PathBuf, work: &mut Work) -> io::Result<()> {
    let raw_metadata = fs::read_to_string(metafile_path).await?;
    let mut field_data: Vec<&str> = vec![];
    let mut field_name: Option<&str> = None;

    for raw_line in raw_metadata.lines() {
        match raw_line {
            "ID" | "URL" | "Original" | "Thumbnail" | "xRestrict" | "AI" | "User" | "UserID"
            | "Title" | "Description" | "Tags" | "Size" | "Bookmark" | "Date" => {
                if field_data.last().unwrap_or(&"").is_empty() {
                    if let Some(field_name) = field_name {
                        parse_metafile_field(field_name, &field_data, work);
                    }
                    field_data.clear();
                    field_name = Some(raw_line);
                }
            }
            _ => field_data.push(raw_line),
        }
    }
    if let Some(field_name) = field_name {
        parse_metafile_field(field_name, &field_data, work);
    }

    Ok(())
}

fn parse_metafile_field(field_name: &str, field_data: &Vec<&str>, work: &mut Work) {
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

fn add_image_asset(image: &PathBuf, work: &mut Work) {
    if let Some(image_name) = image.file_name() {
        if let Ok(image_dimensions) = imagesize::size(image) {
            work.assets.push(ImageAsset {
                name: image_name.to_string_lossy().to_string(),
                path: image.to_string_lossy().to_string(),
                dimensions: ImageDimensions {
                    width: image_dimensions.width,
                    height: image_dimensions.height,
                },
            });
        };
    };
}
