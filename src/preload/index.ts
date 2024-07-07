import { contextBridge, ipcRenderer, shell } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';
import { readFile, readdir, writeFile } from 'fs/promises';
import path from 'path';
import getImageDimensions from 'image-size';
import { collection } from '../main/lib/collection';

export interface Api {
  readDir: typeof readdir; // TODO: Remove these from API
  readFile: typeof readFile;
  writeFile: typeof writeFile;
  path: typeof path;
  getImageDimensions: (imagePath: string) => Promise<{ width: number; height: number }>;

  collection: typeof collection;
  pickDirectory: () => Promise<string>;
  showItemInFolder: typeof shell.showItemInFolder;
}

const api: Api = {
  readDir: readdir,
  readFile,
  writeFile,
  path,
  getImageDimensions: (imagePath) =>
    new Promise((resolve, reject) =>
      getImageDimensions(imagePath, (_, dimensions) => {
        if (!dimensions || dimensions.width === undefined || dimensions.height === undefined) {
          return reject();
        }
        resolve({ width: dimensions.width, height: dimensions.height });
      }),
    ),

  collection,
  pickDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
  showItemInFolder: shell.showItemInFolder,
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}
