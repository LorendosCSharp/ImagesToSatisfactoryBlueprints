import { Jimp } from "jimp";
import fs from "fs";
import { Parser } from "@etothepii/satisfactory-file-parser";
import { app } from "electron";
import path from 'path';

const blueprintPath = path.join(app.getAppPath(), 'basicBlueprint');
const signBlueprintMap: any = {
    tiny: {
        sbp: path.join(blueprintPath, "Tiny.sbp"),
        sbpcfg: path.join(blueprintPath, "Tiny.sbpcfg"),
        spacing: 50
    },
    medium: {
        sbp: path.join(blueprintPath, "Medium.sbp"),
        sbpcfg: path.join(blueprintPath, "Medium.sbpcfg"),
        spacing: 100
    },
    large: {
        sbp: path.join(blueprintPath, "Large.sbp"),
        sbpcfg: path.join(blueprintPath, "Large.sbpcfg"),
        spacing: 200
    }
} as const;

interface ProcessOptions {
    signSize: 'small' | 'medium' | 'large';
    brightness: 'low' | 'normal' | 'high' | 'max';
    imageSize: number;
    outputDir: string;
}

export async function proccessImage(inputPath: string, options: ProcessOptions) {
    console.log("Started processing image with options:", options);

    const outputPath = options.outputDir === 'Desktop'
        ? path.join(app.getPath("desktop"), 'outputBlueprint')
        : path.join(options.outputDir, 'outputBlueprint');

    if (!fs.existsSync(outputPath)) {
        console.log("Creating output folder:", outputPath);
        fs.mkdirSync(outputPath, { recursive: true });
    }

    try {
        const image = await Jimp.read(inputPath);
        const maxSize = Math.min(144, Math.max(1, options.imageSize));

        const scale = Math.min(maxSize / image.width, maxSize / image.height, 1);
        image.resize({
            w: Math.floor(image.width * scale),
            h: Math.floor(image.height * scale),
        });

        // Adjust brightness
        const brightnessMap = {
            low: 0.3,
            normal: 1,
            high: 1.5,
            max: 2,
        } as const;
        image.brightness(brightnessMap[options.brightness]);

        const chosenBlueprint = signBlueprintMap[options.signSize];
        const file = new Uint8Array(fs.readFileSync(chosenBlueprint.sbp)).buffer;
        const configFile = new Uint8Array(fs.readFileSync(chosenBlueprint.sbpcfg)).buffer;

        const blueprint = Parser.ParseBlueprintFiles("SignImage", file, configFile);

        if (blueprint.objects.length > 0) {
            const sign = blueprint.objects[0];
            blueprint.objects = [];

            // Sign scaling


            for (let x = 0; x < image.width; x++) {
                for (let y = 0; y < image.height; y++) {
                    const duplicate = JSON.parse(JSON.stringify(sign));

                    duplicate.transform.translation.y = ((x * chosenBlueprint.spacing) + (chosenBlueprint.spacing / 2)) - (chosenBlueprint.spacing * (image.width / 2));
                    duplicate.transform.translation.z = (image.height - y) * chosenBlueprint.spacing;

                    const pixelColorHex = image.getPixelColor(x, y);
                    const pixelColorRGBA = jimpColorToRgba(pixelColorHex);

                    if (pixelColorHex == 0) {
                        continue;
                    }

                    // Apply color to sign
                    for (const key of ['mForegroundColor', 'mBackgroundColor', 'mAuxilaryColor']) {
                        if (duplicate.properties[key]) {
                            const c = duplicate.properties[key].value;
                            c.r = pixelColorRGBA.r;
                            c.g = pixelColorRGBA.g;
                            c.b = pixelColorRGBA.b;
                            c.a = pixelColorRGBA.a;
                        }
                    }

                    blueprint.objects.push(duplicate);
                }
            }
        }

        const mainFileBodyChunks: Uint8Array[] = [];
        let mainFileHeader: Uint8Array | undefined;

        const summary = Parser.WriteBlueprintFiles(
            blueprint,
            (header: Uint8Array) => { mainFileHeader = header; },
            (chunk: Uint8Array) => { mainFileBodyChunks.push(chunk); }
        );

        if (!mainFileHeader) throw new Error("Main file header is missing!");

        fs.writeFileSync(path.join(outputPath, "Image.sbp"),
            new Uint8Array(Buffer.concat([mainFileHeader, ...mainFileBodyChunks]))
        );

        fs.writeFileSync(path.join(outputPath, "Image.sbpcfg"),
            new Uint8Array(summary.configFileBinary)
        );

        console.log("Image processed successfully!");
        return path.join(outputPath, "Image.sbp");

    } catch (err) {
        console.error("Error processing image:", err);
    }

    return null;
}

function jimpColorToRgba(color: number) {
    const r = (color >> 24) & 0xff;
    const g = (color >> 16) & 0xff;
    const b = (color >> 8) & 0xff;
    const a = color & 0xff;
    return {
        r: +(r / 255).toFixed(2),
        g: +(g / 255).toFixed(2),
        b: +(b / 255).toFixed(2),
        a: +(a / 255).toFixed(2),
    };
}
