import * as ParserPkg from "@etothepii/satisfactory-file-parser";

const { Parser } = ParserPkg;

type SignSize = "tiny" | "medium" | "large"
type Brightness = "low" | "normal" | "high" | "max"

interface Options {
    signSize: SignSize
    brightness: Brightness
    imageSize: number
    skipTransparentPixels: boolean
}

const signBlueprintMap = {
    tiny: { sbp: "/basicBlueprint/Tiny.sbp", sbpcfg: "/basicBlueprint/Tiny.sbpcfg", spacing: 50 },
    medium: { sbp: "/basicBlueprint/Medium.sbp", sbpcfg: "/basicBlueprint/Medium.sbpcfg", spacing: 100 },
    large: { sbp: "/basicBlueprint/Large.sbp", sbpcfg: "/basicBlueprint/Large.sbpcfg", spacing: 200 },
} as const

function brightnessMultiplier(b: Brightness) {
    switch (b) {
        case "low": return 0.3
        case "normal": return 1
        case "high": return 1.5
        case "max": return 2
    }
}

// Helper to concatenate multiple Uint8Arrays
function concatUint8Arrays(arrays: Uint8Array[]): Uint8Array {
    const total = arrays.reduce((sum, a) => sum + a.length, 0)
    const out = new Uint8Array(total)
    let offset = 0
    for (const a of arrays) {
        out.set(a, offset)
        offset += a.length
    }
    return out
}

async function loadBlueprint(sbp: string, sbpcfg: string) {

    const folderPrefix = "/ImagesToSatisfactoryBlueprints"

    const [sbpRes, cfgRes] = await Promise.all([
        fetch(`${folderPrefix}${sbp}`),
        fetch(`${folderPrefix}${sbpcfg}`)
    ])

    const [sbpArray, cfgArray] = await Promise.all([
        sbpRes.arrayBuffer(),
        cfgRes.arrayBuffer()
    ]);

    const file = new Uint8Array(sbpArray);
    const configFile = new Uint8Array(cfgArray);

    return { sbpArray, cfgArray };
}

export async function processImageFileAndGenerate(
    file: File,
    options: Options
): Promise<{ sbp: ArrayBuffer; sbpcfg: ArrayBuffer }> {

    // 1) Load image into canvas
    const imgBitmap = await createImageBitmap(file)
    const maxSize = Math.min(144, Math.max(1, options.imageSize))
    const scale = Math.min(maxSize / imgBitmap.width, maxSize / imgBitmap.height, 1)
    const w = Math.floor(imgBitmap.width * scale)
    const h = Math.floor(imgBitmap.height * scale)

    const canvas = document.createElement("canvas")
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext("2d")!
    ctx.drawImage(imgBitmap, 0, 0, w, h)

    // 2) Apply brightness multiplier
    const imageData = ctx.getImageData(0, 0, w, h)
    const mult = brightnessMultiplier(options.brightness)
    for (let i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i] = Math.min(255, imageData.data[i] * mult)       // R
        imageData.data[i + 1] = Math.min(255, imageData.data[i + 1] * mult) // G
        imageData.data[i + 2] = Math.min(255, imageData.data[i + 2] * mult) // B
        // alpha stays as-is
    }
    ctx.putImageData(imageData, 0, 0)

    // 3) Fetch blueprint template files
    const map = signBlueprintMap[options.signSize]


    const { sbpArray: sbp, cfgArray: sbpcfg } = await loadBlueprint(map.sbp, map.sbpcfg);

    // 4) Parse Blueprint safely
    // Important: pass raw ArrayBuffer from fetch directly — do NOT do new Uint8Array(...).buffer
    const blueprint = Parser.ParseBlueprintFiles(
        "SignImage", sbp, sbpcfg);
    if (blueprint.objects.length === 0) throw new Error("No objects found in template blueprint")

    const sign = JSON.parse(JSON.stringify(blueprint.objects[0]))
    blueprint.objects = []

    // 5) Build objects from pixels
    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
            const idx = (y * w + x) * 4
            const r = imageData.data[idx]
            const g = imageData.data[idx + 1]
            const b = imageData.data[idx + 2]
            const a = imageData.data[idx + 3]

            if (a < 10 && options.skipTransparentPixels) continue // skip transparent

            const duplicate = JSON.parse(JSON.stringify(sign))
            duplicate.transform.translation.y = ((x * map.spacing) + (map.spacing / 2)) - (map.spacing * (w / 2))
            duplicate.transform.translation.z = (h - y) * map.spacing

            for (const key of ["mForegroundColor", "mBackgroundColor", "mAuxilaryColor"]) {
                if (duplicate.properties && duplicate.properties[key]) {
                    const c = duplicate.properties[key].value
                    c.r = +(r / 255).toFixed(2)
                    c.g = +(g / 255).toFixed(2)
                    c.b = +(b / 255).toFixed(2)
                    c.a = +(a / 255).toFixed(2)
                }
            }

            blueprint.objects.push(duplicate)
        }
    }

    // 6) Serialize blueprint back to ArrayBuffers
    const mainFileBodyChunks: Uint8Array[] = []
    let mainFileHeader: Uint8Array | undefined

    const summary = Parser.WriteBlueprintFiles(
        blueprint,
        (header: Uint8Array) => { mainFileHeader = header },
        (chunk: Uint8Array) => { mainFileBodyChunks.push(chunk) }
    )

    if (!mainFileHeader) throw new Error("Main file header missing")

    const mainFile = new Uint8Array(concatUint8Arrays([mainFileHeader, ...mainFileBodyChunks]))
    const cfgFile = new Uint8Array(summary.configFileBinary)

    return {
        sbp: mainFile.buffer.slice(0),  // slice to ensure no view/offset mismatch
        sbpcfg: cfgFile.buffer.slice(0)
    }
}
