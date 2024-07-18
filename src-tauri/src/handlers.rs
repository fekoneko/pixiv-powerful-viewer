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
pub fn read_collection(collection_path: &str) -> Vec<Work> {
    vec![Work {
        path: String::from(collection_path),
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
    }]
}
