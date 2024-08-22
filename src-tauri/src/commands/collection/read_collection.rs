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
    if !collection_path.is_dir() {
        return Err(format!(
            "Collection is not a directory: {}",
            collection_path.display()
        ));
    }

    let initial_path = collection_path.clone();
    let original_pid = *pid.lock().await;
    let works: Mutex<Vec<Work>> = Mutex::new(vec![]);
    let warnings: Mutex<Vec<String>> = Mutex::new(vec![]);
    let work_key: Mutex<u64> = Mutex::new(0);

    let cancel_when = || {
        let pid = pid.lock();
        async move { *pid.await != original_pid }
    };

    reursively_read_works(
        initial_path,
        &collection_path,
        &works,
        &warnings,
        &work_key,
        &cancel_when,
    )
    .await
    .map_err(|error| format!("Unexpected file system error: {error}"))?;

    Ok((works.into_inner(), warnings.into_inner()))
}

async fn reursively_read_works<CancelWhen, CancelWhenFuture>(
    current_path: PathBuf,
    collection_path: &PathBuf,
    works: &Mutex<Vec<Work>>,
    warnings: &Mutex<Vec<String>>,
    work_key: &Mutex<u64>,
    cancel_when: &CancelWhen,
) -> io::Result<()>
where
    CancelWhen: Fn() -> CancelWhenFuture + Sync,
    CancelWhenFuture: Future<Output = bool>,
{
    if cancel_when().await {
        let message = String::from(format!("Reading {} was canceled", current_path.display()));
        warnings.lock().await.push(message);
        return Ok(());
    }

    let mut dir_entires = fs::read_dir(current_path.clone()).await?;
    let mut asset_group: Vec<PathBuf> = vec![];
    let mut futures: Vec<_> = vec![];

    while let Some(entry) = dir_entires.next_entry().await? {
        if entry.metadata().await?.is_dir() {
            futures.push(reursively_read_works(
                entry.path(),
                collection_path,
                works,
                warnings,
                work_key,
                cancel_when,
            ));
        } else {
            asset_group.push(entry.path());
        }
    }
    join_all(futures).await;

    if asset_group.len() == 0 {
        return Ok(());
    }

    let mut work_key = work_key.lock().await;
    match parse_work(collection_path, &current_path, &asset_group, *work_key).await {
        Ok(Some(work)) => {
            works.lock().await.push(work);
            *work_key += 1;
        }
        Ok(None) => (),
        Err(error) => {
            let message = String::from(format!(
                "Failed to parse '{}': {error}",
                current_path.display()
            ));
            warnings.lock().await.push(message);
        }
    };
    Ok(())
}
