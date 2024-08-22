use std::path::MAIN_SEPARATOR;
use tokio::fs;

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
