import { ipcMain, dialog } from 'electron';
import { proccessImage } from './imageProcessor';
import fs from "fs";
import path from 'path';
let imagePath: string = "";
export function setupIpcHandlers() {
    ipcMain.handle('select-image', async () => {
        const result = await dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif'] }],
        });

        if (result.canceled || !result.filePaths[0]) return null;

        const filePath = result.filePaths[0];
        imagePath = filePath;
        const ext = path.extname(filePath).slice(1);
        // Read file content as base64
        const data = fs.readFileSync(filePath).toString('base64');
        return `data:image/${ext};base64,${data}`;
    });

    ipcMain.handle('process-image', async (_event) => {
        return proccessImage(imagePath); // delegate to imageProcessor
    });

}
