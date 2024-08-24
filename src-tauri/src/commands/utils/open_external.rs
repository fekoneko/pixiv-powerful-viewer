#[tauri::command]
pub fn open_external(path_or_url: String) -> Result<(), String> {
    opener::open(path_or_url).map_err(|error| error.to_string())
}
