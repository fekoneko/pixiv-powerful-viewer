use std::path::MAIN_SEPARATOR;
use tokio::fs;

#[tauri::command]
pub async fn read_collection_list(
    collection_path: String,
    list_name: String,
) -> Option<Vec<String>> {
    let path = format!("{collection_path}{MAIN_SEPARATOR}.{list_name}");

    println!("Reading collection list '{}' from '{}'", list_name, path);
    if let Ok(list_contents) = fs::read_to_string(path).await {
        let lines = list_contents.lines().map(|line| line.to_string()).collect();
        Some(lines)
    } else {
        None
    }
}
