use serde::{Serialize, Serializer};
use std::sync::Arc;
use tokio::sync::Mutex;

pub struct SharedBuffer<T: Sized>(pub Arc<Mutex<Vec<T>>>);

impl<T: Sized + Serialize> Serialize for SharedBuffer<T> {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        if let Ok(mut guard) = self.0.try_lock() {
            let serialization_result = guard.serialize(serializer);
            guard.clear(); // Clear the buffer after it is sent by Tauri
            serialization_result
        } else {
            Err(serde::ser::Error::custom("Mutex is locked"))
        }
    }
}

impl<T: Sized> Clone for SharedBuffer<T> {
    fn clone(&self) -> Self {
        SharedBuffer(self.0.clone())
    }
}
