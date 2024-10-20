import { invoke } from '@tauri-apps/api/core';
import { Work } from '@/types/collection';
import { MessageType, SearchWorkerResponse } from '@/lib/collection/search-worker';

let searchWorkerCallId = 0;

export interface CollectionChunk {
  finished: boolean;
  works: Omit<Work, 'key'>[];
  warnings: string[];
}

export type CollectionReader = () => AsyncGenerator<CollectionChunk>;

export const getCollectionReader = (collectionPath: string): CollectionReader => {
  let firstIteration = true;

  return async function* () {
    while (true) {
      if (firstIteration) {
        const { warnings } = await invoke<{ warnings: string[] }>('start_reading_collection', {
          collectionPath,
        });
        firstIteration = false;

        yield { finished: false, works: [], warnings };
      }

      await new Promise((resolve) => setTimeout(resolve, 500));

      const chunk = await invoke<CollectionChunk>('poll_next_collection_chunk').catch(() => ({
        finished: false,
        works: [],
        warnings: [],
      }));

      yield chunk;
      if (chunk.finished) break;
    }
  };
};

const callSearchWorker = async (searchWorker: Worker, type: MessageType, payload: unknown) => {
  const id = searchWorkerCallId++;
  searchWorker.postMessage({ id, type, payload });

  return new Promise((resolve, reject) => {
    const handleMessage = ({ data }: MessageEvent<SearchWorkerResponse>) => {
      if (data.id !== id) return;
      if (data.error) return reject(data.error);

      searchWorker.removeEventListener('message', handleMessage);
      resolve(data.payload);
    };
    searchWorker.addEventListener('message', handleMessage);
  });
};

export const indexWorks = async (searchWorker: Worker, works: Work[]) =>
  callSearchWorker(searchWorker, 'index', works) as Promise<void>;

export const searchWorks = async (searchWorker: Worker, query: string) =>
  callSearchWorker(searchWorker, 'search', query) as Promise<Work[] | null>;
