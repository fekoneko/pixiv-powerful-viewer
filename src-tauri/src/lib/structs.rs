#[derive(serde::Serialize)]
#[allow(non_snake_case)]
pub struct Work {
    pub path: String,
    pub relativePath: String,
    pub title: String,
    pub userName: String,
    pub assets: Vec<ImageAsset>,

    pub id: Option<u64>,
    pub userId: Option<u64>,
    pub url: Option<String>,
    pub imageUrl: Option<String>,
    pub thumbnailUrl: Option<String>,
    pub ageRestriction: Option<String>,
    pub ai: Option<bool>,
    pub description: Option<String>,
    pub tags: Option<Vec<String>>,
    pub dimensions: Option<ImageDimensions>,
    pub bookmarks: Option<u64>,
    pub uploadTime: Option<String>,
}

#[derive(serde::Serialize)]
pub struct ImageAsset {
    pub name: String,
    pub path: String,
    pub dimensions: ImageDimensions,
}

#[derive(serde::Serialize)]
pub struct ImageDimensions {
    pub width: usize,
    pub height: usize,
}
