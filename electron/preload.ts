import { ipcRenderer, contextBridge } from 'electron'


declare global {
  interface Window {
    electronAPI: {
      selectImage: () => Promise<string | null>;
      proccessImage: (imagePath: string, options: any) => Promise<string | null>;
      selectDir: () => Promise<string | null>;
    };
  }
}
// In preload.ts
contextBridge.exposeInMainWorld('electronAPI', {
  selectImage: () => ipcRenderer.invoke('select-image'),
  proccessImage: (imagePath: string, options: any) => ipcRenderer.invoke("process-image", imagePath, options),
  selectDir: () => ipcRenderer.invoke('select-dir')
})

