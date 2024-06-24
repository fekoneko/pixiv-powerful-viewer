import { contextBridge, ipcRenderer, shell } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';
import { readFile, readdir, writeFile } from 'fs/promises';
import getImageDimensions from 'image-size';

export interface Api {
  readDir: typeof readdir;
  readFile: typeof readFile;
  writeFile: typeof writeFile;
  getImageDimensions: typeof getImageDimensions;
  pickDirectory: () => Promise<string>;
  showItemInFolder: typeof shell.showItemInFolder;
}

const api: Api = {
  readDir: readdir,
  readFile,
  writeFile,
  getImageDimensions,
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
