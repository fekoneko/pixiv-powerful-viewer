import { invoke } from '@tauri-apps/api';
import { Work } from '@/types/collection';
import { MessageType, SearchWorkerResponse } from '@/lib/collection/search-worker';

let nextid = 0;

export const readCollection = async (
  collectionPath: string,
): Promise<[works: Work[], errors: string[]]> => invoke('read_collection', { collectionPath });

const callSearchWorker = async (searchWorker: Worker, type: MessageType, payload: unknown) => {
  const id = nextid++;
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
