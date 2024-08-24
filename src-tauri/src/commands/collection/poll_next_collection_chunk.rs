use crate::{
    lib::{SharedBuffer, Work},
    GlobalState,
};
use tauri::State;

#[derive(serde::Serialize)]
pub struct Response {
    finished: bool,
    works: SharedBuffer<Work>,
    warnings: SharedBuffer<String>,
}

#[tauri::command]
#[allow(unused_must_use)]
pub async fn poll_next_collection_chunk(state: State<'_, GlobalState>) -> Result<Response, ()> {
    let finished = *state.read_collection_finished.clone().lock().await;
    let works = state.read_collection_works.clone();
    let warnings = state.read_collection_warnings.clone();

    // Await the locks to make sure SharedBuffer can get them too
    works.0.lock().await;
    warnings.0.lock().await;

    Ok(Response {
        finished,
        works,
        warnings,
    })
}
