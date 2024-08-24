use crate::commands::collection::parse_work;
use crate::commands::collection::structs::Work;
use crate::lib::serializable::SerializableArcMutex;
use crate::Pids;
use futures::future::join_all;
use futures::io;
use std::num::NonZeroUsize;
use std::path::{Path, PathBuf};
use std::sync::Arc;
use std::thread::available_parallelism;
use std::u64;
use std::vec;
use tauri::{async_runtime, State};
use tokio::fs;
use tokio::sync::Mutex;

#[tauri::command]
pub async fn read_collection(
    collection_path: String,
    pids: State<'_, Pids>,
) -> Result<
    (
        SerializableArcMutex<Vec<Work>>,
        SerializableArcMutex<Vec<String>>,
    ),
    String,
> {
    let pid = pids.read_collection_pid.clone();
    *pid.lock().await += 1;

    let collection_path: PathBuf = Path::new(&collection_path).into();
    let original_pid = *pid.lock().await;
    let asset_goups = Mutex::new(vec![]);
    let works = SerializableArcMutex(Arc::new(Mutex::new(vec![] as Vec<Work>)));
    let warnings = SerializableArcMutex(Arc::new(Mutex::new(vec![] as Vec<String>)));
    let work_key = Arc::new(Mutex::new(0u64));

    let cancel_if = move || {
        let pid = pid.try_lock();
        pid.is_ok() && *pid.unwrap() != original_pid
    };

    println!(
        "Reading file structure of '{}'...",
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

    println!("Parsing the collection works ({})...", collection_size);
    println!("Using {} threads + main thread", max_threads_count);

    for asset_gorups_chunk in asset_goups.chunks(thread_chunk_size) {
        let asset_gorups_chunk = asset_gorups_chunk.to_vec();
        let collection_path = collection_path.clone();
        let works = works.clone();
        let warnings = warnings.clone();
        let work_key = work_key.clone();
        let cancel_if = cancel_if.clone();

        println!(
            "Spawning new thread ({} works)...",
            asset_gorups_chunk.len()
        );

        join_handles.push(async_runtime::spawn(process_asset_groups(
            asset_gorups_chunk,
            collection_path,
            works,
            warnings,
            work_key,
            cancel_if,
        )));
    }

    join_all(join_handles).await;

    println!("\nDone reading the collection\n");

    Ok((works, warnings))
}

async fn get_asset_groups(
    path: PathBuf,
    asset_goups: &Mutex<Vec<(PathBuf, Vec<PathBuf>)>>,
    warnings: &SerializableArcMutex<Vec<String>>,
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
    works: SerializableArcMutex<Vec<Work>>,
    warnings: SerializableArcMutex<Vec<String>>,
    work_key: Arc<Mutex<u64>>,
    cancel_if: impl Fn() -> bool + Sync + Send + 'static,
) {
    let futures: Vec<_> = asset_goups
        .iter()
        .map(|asset_group| async {
            if cancel_if() {
                let message = String::from(format!(
                    "Parsing work '{}' was canceled",
                    asset_group.0.display()
                ));
                warnings.0.lock().await.push(message);
                return;
            }

            let mut work_key = work_key.lock().await;
            match parse_work(&collection_path, &asset_group.0, &asset_group.1, *work_key).await {
                Ok(Some(work)) => {
                    works.0.lock().await.push(work);
                    *work_key += 1;
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
}
