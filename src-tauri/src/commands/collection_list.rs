use std::path::MAIN_SEPARATOR;
use tokio::fs;

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
