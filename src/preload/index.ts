import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';
import { readFile, readdir, writeFile } from 'fs/promises';

export interface Api {
  readDir: typeof readdir;
  readFile: typeof readFile;
  writeFile: typeof writeFile;
  pickDirectory: () => Promise<string>;
}
const api: Api = {
  readDir: readdir,
  readFile: readFile,
  writeFile: writeFile,
  pickDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
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
