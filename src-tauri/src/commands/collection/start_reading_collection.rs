use crate::{
    commands::collection::parse_work,
    lib::{SharedBuffer, Work},
    GlobalState,
};
use futures::future::join_all;
use std::{
    num::NonZeroUsize,
    path::{Path, PathBuf},
    thread::available_parallelism,
    time::Duration,
    vec,
};
use tauri::{async_runtime, State};
use tokio::{fs, io, sync::Mutex, time::sleep};

#[derive(serde::Serialize)]
pub struct Response {
    warnings: SharedBuffer<String>,
}

#[tauri::command]
pub async fn start_reading_collection(
    collection_path: String,
    state: State<'_, GlobalState>,
) -> Result<Response, String> {
    let pid = state.read_collection_pid.clone();
    let finished = state.read_collection_finished.clone();
    let works = state.read_collection_works.clone();
    let warnings = state.read_collection_warnings.clone();
    *pid.lock().await += 1;
    *finished.lock().await = false;
    *warnings.0.lock().await = vec![];
    *works.0.lock().await = vec![];

    let collection_path: PathBuf = Path::new(&collection_path).into();
    let original_pid = *pid.lock().await;
    let asset_goups = Mutex::new(vec![]);

    println!(
        "Reading folder structure of '{}'...",
        collection_path.display()
    );

    get_asset_groups(collection_path.clone(), &asset_goups, &warnings)
        .await
        .map_err(|error| format!("Unexpected error while reading collection: {error}"))?;

    let asset_goups = asset_goups.into_inner();
    let collection_size = asset_goups.len();
    let max_threads_count = available_parallelism()
        .unwrap_or(NonZeroUsize::new(1).unwrap())
        .get()
        .max(2)
        - 1;
    let thread_chunk_size = collection_size / max_threads_count + 1;
    let mut join_handles: Vec<_> = vec![];
    let mut thread_id: usize = 1;

    println!("Parsing the collection works ({})...", collection_size);
    println!("Using {} threads", max_threads_count);

    for asset_gorups_chunk in asset_goups.chunks(thread_chunk_size) {
        let asset_gorups_chunk = asset_gorups_chunk.to_vec();
        let chunk_size = asset_gorups_chunk.len();
        let collection_path = collection_path.clone();
        let works = works.clone();
        let warnings = warnings.clone();

        join_handles.push(async_runtime::spawn(process_asset_groups(
            asset_gorups_chunk,
            collection_path,
            works,
            warnings,
            thread_id,
        )));

        println!("Spawned thread #{thread_id} ({chunk_size} works)");
        thread_id += 1;
    }

    async_runtime::spawn(async move {
        loop {
            sleep(Duration::from_millis(500)).await;

            if *pid.lock().await != original_pid {
                join_handles
                    .iter()
                    .for_each(|join_handle| join_handle.abort());
                println!("Reading the collection was canceled");
                return;
            }
            if join_handles
                .iter()
                .all(|join_handle| join_handle.inner().is_finished())
            {
                println!("Done reading the collection");
                *finished.lock().await = true;
                return;
            }
        }
    });

    Ok(Response { warnings })
}

async fn get_asset_groups(
    path: PathBuf,
    asset_goups: &Mutex<Vec<(PathBuf, Vec<PathBuf>)>>,
    warnings: &SharedBuffer<String>,
) -> io::Result<()> {
    let mut dir_entires = fs::read_dir(path.clone()).await?;
    let mut asset_paths: Vec<PathBuf> = vec![];
    let mut futures: Vec<_> = vec![];

    while let Some(entry) = dir_entires.next_entry().await? {
        if entry.metadata().await?.is_dir() {
            futures.push(get_asset_groups(entry.path(), asset_goups, warnings));
        } else {
            asset_paths.push(entry.path());
        }
    }

    for result in join_all(futures).await.iter() {
        if let Err(error) = result {
            let message = String::from(format!(
                "Failed to read some child of '{}': {error}",
                path.display() // TODO: Add Anyhow and provide actual path
            ));
            warnings.0.lock().await.push(message);
        }
    }

    if asset_paths.len() != 0 {
        asset_goups.lock().await.push((path, asset_paths));
    }
    Ok(())
}

async fn process_asset_groups(
    asset_goups: Vec<(PathBuf, Vec<PathBuf>)>,
    collection_path: PathBuf,
    works: SharedBuffer<Work>,
    warnings: SharedBuffer<String>,
    thread_id: usize,
) {
    let futures: Vec<_> = asset_goups
        .iter()
        .map(|asset_group| async {
            match parse_work(&collection_path, &asset_group.0, &asset_group.1).await {
                Ok(Some(work)) => {
                    works.0.lock().await.push(work);
                }
                Ok(None) => (),
                Err(error) => {
                    let message = String::from(format!(
                        "Failed to parse '{}': {error}",
                        asset_group.0.display()
                    ));
                    warnings.0.lock().await.push(message);
                }
            };
        })
        .collect();

    join_all(futures).await;
    println!("Thread #{thread_id} finished parsing");
}
