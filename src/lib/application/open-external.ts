import { invoke } from '@tauri-apps/api/core';

export const openExternal = async (pathOrUrl: string): Promise<void> =>
  invoke('open_external', { pathOrUrl });
