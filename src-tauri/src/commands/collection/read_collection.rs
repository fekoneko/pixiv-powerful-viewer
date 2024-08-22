use crate::commands::collection::parse_work;
use crate::commands::collection::structs::Work;
use crate::Pids;
use futures::future::join_all;
use futures::io;
use std::future::Future;
use std::path::{Path, PathBuf};
use std::u64;
use std::vec;
use tauri::State;
use tokio::fs;
use tokio::sync::Mutex;

#[tauri::command]
pub async fn read_collection(
    collection_path: String,
    pids: State<'_, Pids>,
) -> Result<(Vec<Work>, Vec<String>), String> {
    let pid = pids.read_collection_pid.clone();
    *pid.lock().await += 1;

    let collection_path: PathBuf = Path::new(&collection_path).into();
    let original_pid = *pid.lock().await;
    let asset_goups: Mutex<Vec<(PathBuf, Vec<PathBuf>)>> = Mutex::new(vec![]);
    let works: Mutex<Vec<Work>> = Mutex::new(vec![]);
    let warnings: Mutex<Vec<String>> = Mutex::new(vec![]);
    let work_key: Mutex<u64> = Mutex::new(0);

    let cancel_if = || {
        let pid = pid.lock();
        async move { *pid.await != original_pid }
    };

    get_asset_groups(collection_path.clone(), &asset_goups, &warnings, &cancel_if)
        .await
        .map_err(|error| format!("Unexpected error while reading collection: {error}"))?;

    process_asset_groups(
        &asset_goups,
        &collection_path,
        &works,
        &warnings,
        &work_key,
        &cancel_if,
    )
    .await;

    Ok((works.into_inner(), warnings.into_inner()))
}

async fn get_asset_groups<CancelIf, CancelIfFuture>(
    path: PathBuf,
    asset_goups: &Mutex<Vec<(PathBuf, Vec<PathBuf>)>>,
    warnings: &Mutex<Vec<String>>,
    cancel_if: &CancelIf,
) -> io::Result<()>
where
    CancelIf: Fn() -> CancelIfFuture + Sync,
    CancelIfFuture: Future<Output = bool>,
{
    if cancel_if().await {
        let message = String::from(format!("Reading '{}' was canceled", path.display()));
        warnings.lock().await.push(message);
        return Ok(());
    }

    let mut dir_entires = fs::read_dir(path.clone()).await?;
    let mut asset_paths: Vec<PathBuf> = vec![];
    let mut futures: Vec<_> = vec![];

    while let Some(entry) = dir_entires.next_entry().await? {
        if entry.metadata().await?.is_dir() {
            futures.push(get_asset_groups(
                entry.path(),
                asset_goups,
                warnings,
                cancel_if,
            ));
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
            warnings.lock().await.push(message);
        }
    }

    if asset_paths.len() != 0 {
        asset_goups.lock().await.push((path, asset_paths));
    }
    Ok(())
}

async fn process_asset_groups<CancelIf, CancelIfFuture>(
    asset_goups: &Mutex<Vec<(PathBuf, Vec<PathBuf>)>>,
    collection_path: &PathBuf,
    works: &Mutex<Vec<Work>>,
    warnings: &Mutex<Vec<String>>,
    work_key: &Mutex<u64>,
    cancel_if: &CancelIf,
) where
    CancelIf: Fn() -> CancelIfFuture + Sync,
    CancelIfFuture: Future<Output = bool>,
{
    let asset_goups = asset_goups.lock().await;

    let futures = asset_goups
        .iter()
        .map(|asset_group| async {
            if cancel_if().await {
                let message = String::from(format!(
                    "Parsing work '{}' was canceled",
                    asset_group.0.display()
                ));
                warnings.lock().await.push(message);
                return;
            }

            let mut work_key = work_key.lock().await;
            match parse_work(collection_path, &asset_group.0, &asset_group.1, *work_key).await {
                Ok(Some(work)) => {
                    works.lock().await.push(work);
                    *work_key += 1;
                }
                Ok(None) => (),
                Err(error) => {
                    let message = String::from(format!(
                        "Failed to parse '{}': {error}",
                        asset_group.0.display()
                    ));
                    warnings.lock().await.push(message);
                }
            };
        })
        .collect::<Vec<_>>();

    join_all(futures).await;
}
