use serde::{Serialize, Serializer};
use std::sync::Arc;
use tokio::sync::Mutex;

pub struct SerializableArcMutex<T: ?Sized>(pub Arc<Mutex<T>>);

impl<T: ?Sized + Serialize> Serialize for SerializableArcMutex<T> {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        self.0.try_lock().unwrap().serialize(serializer)
    }
}

impl<T: ?Sized> Clone for SerializableArcMutex<T> {
    fn clone(&self) -> Self {
        SerializableArcMutex(self.0.clone())
    }
}
