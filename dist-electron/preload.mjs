"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  selectImage: () => electron.ipcRenderer.invoke("select-image"),
  proccessImage: () => electron.ipcRenderer.invoke("process-image"),
  selectDir: () => electron.ipcRenderer.invoke("select-dir")
});
