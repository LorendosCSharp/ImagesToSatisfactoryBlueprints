import { ipcRenderer, contextBridge } from 'electron'


declare global {
  interface Window {
    electronAPI: {
      selectImage: () => Promise<string | null>;
      proccessImage: () => Promise<string | null>;
    };
  }
}
contextBridge.exposeInMainWorld('electronAPI', {
  selectImage: () => ipcRenderer.invoke('select-image'),
  proccessImage: () => ipcRenderer.invoke("process-image")
});
