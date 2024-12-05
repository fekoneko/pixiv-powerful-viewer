#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Work {
    pub path: String,
    pub relative_path: String,
    pub title: String,
    pub user_name: String,
    pub image_assets: Vec<Asset>,
    pub novel_asset: Option<Asset>,

    pub id: Option<u64>,
    pub user_id: Option<u64>,
    pub url: Option<String>,
    pub image_url: Option<String>,
    pub thumbnail_url: Option<String>,
    pub age_restriction: Option<String>,
    pub ai: Option<bool>,
    pub description: Option<String>,
    pub tags: Option<Vec<String>>,
    pub dimensions: Option<ImageDimensions>,
    pub bookmarks: Option<u64>,
    pub upload_time: Option<String>,
}

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Asset {
    pub name: String,
    pub path: String,
}

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ImageDimensions {
    pub width: usize,
    pub height: usize,
}
