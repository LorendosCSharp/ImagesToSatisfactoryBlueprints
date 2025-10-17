
import { Jimp } from "jimp";
import fs from "fs";
import { Parser } from "@etothepii/satisfactory-file-parser";
import { app } from "electron";
import path from 'path'

const blueprintPath = path.join(app.getAppPath(), 'basicBlueprint');
const outputPath = path.join(app.getPath("desktop"), 'outputBlueprint');
// Load an image
export async function proccessImage(inputPath: string) {
    console.log("Strated proccessing image!");

    if (!fs.existsSync(outputPath)) {
        console.error("No output folder was found!")
        console.log("Creating folder on desktop")
        fs.mkdirSync(outputPath)

    }

    try {
        const image = await Jimp.read(inputPath);
        const maxSize = 96;
        const scale = Math.min(maxSize / image.width, maxSize / image.height, 1);
        image.resize({ w: Math.floor(image.width * scale), h: Math.floor(image.height * scale) });

        const file = new Uint8Array(fs.readFileSync(path.join(blueprintPath, "basicBlueprint.sbp"))).buffer;
        const configFile = new Uint8Array(fs.readFileSync(path.join(blueprintPath, "basicBlueprint.sbpcfg"))).buffer;

        const blueprint = Parser.ParseBlueprintFiles("SignImage", file, configFile);

        if (blueprint.objects.length > 0) {
            const sign = blueprint.objects[0];
            blueprint.objects = [];
            for (let x = 0; x < image.width; x++) {
                for (let y = 0; y < image.height; y++) {
                    const duplicate = JSON.parse(JSON.stringify(sign));

                    duplicate.transform.translation.x = (x * 50) + 25;
                    duplicate.transform.translation.z = (image.height - y) * 50;

                    const pixelColorHex = image.getPixelColor(x, y);
                    const pixelColorRGBA = jimpColorToRgba(pixelColorHex);
                    // Change its color (foreground, background, auxiliary)
                    if (duplicate.properties.mForegroundColor) {
                        duplicate.properties.mForegroundColor.value.r = pixelColorRGBA.r;
                        duplicate.properties.mForegroundColor.value.g = pixelColorRGBA.g;
                        duplicate.properties.mForegroundColor.value.b = pixelColorRGBA.b;
                        duplicate.properties.mForegroundColor.value.a = pixelColorRGBA.a;
                    }
                    if (duplicate.properties.mBackgroundColor) {
                        duplicate.properties.mBackgroundColor.value.r = pixelColorRGBA.r;
                        duplicate.properties.mBackgroundColor.value.g = pixelColorRGBA.g;
                        duplicate.properties.mBackgroundColor.value.b = pixelColorRGBA.b;
                        duplicate.properties.mBackgroundColor.value.a = pixelColorRGBA.a;
                    }
                    if (duplicate.properties.mAuxilaryColor) {
                        duplicate.properties.mAuxilaryColor.value.r = pixelColorRGBA.r;
                        duplicate.properties.mAuxilaryColor.value.g = pixelColorRGBA.g;
                        duplicate.properties.mAuxilaryColor.value.b = pixelColorRGBA.b;
                        duplicate.properties.mAuxilaryColor.value.a = pixelColorRGBA.a;
                    }

                    // Add to objects
                    blueprint.objects.push(duplicate);

                }
            }
        }
        const mainFileBodyChunks: Uint8Array[] = []
        let mainFileHeader: Uint8Array | undefined

        const summary = Parser.WriteBlueprintFiles(
            blueprint,
            (header: Uint8Array) => {
                mainFileHeader = header
            },
            (chunk: Uint8Array) => {
                mainFileBodyChunks.push(chunk)
            }
        )

        if (!mainFileHeader) {
            throw new Error("Main file header is missing!")
        }


        fs.writeFileSync(path.join(outputPath, "Image.sbp"), new Uint8Array(Buffer.concat([mainFileHeader, ...mainFileBodyChunks])));
        // Save .sbpcfg
        fs.writeFileSync(path.join(outputPath, "Image.sbpcfg"), new Uint8Array(summary.configFileBinary));
        console.log("Image processed!");
    } catch (err) {
        console.error("Error processing image:", err);
    }

    return path.join(outputPath, "Image.sbp");
};


function jimpColorToRgba(color: number): { r: number; g: number; b: number; a: number } {
    const r = (color >> 24) & 0xff
    const g = (color >> 16) & 0xff
    const b = (color >> 8) & 0xff
    const a = color & 0xff

    return {
        r: +(r / 255).toFixed(2),
        g: +(g / 255).toFixed(2),
        b: +(b / 255).toFixed(2),
        a: +(a / 255).toFixed(2),
    }
}
