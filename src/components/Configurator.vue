<script setup lang="ts">
import { ref, computed, defineProps, defineEmits } from "vue"
import { processImageFileAndGenerate } from "../utils/imageProccessor"
import Toggle from "./Toggle.vue";
const props = defineProps<{ imageFile: File | null }>()
const emit = defineEmits<{ (e: "update:imageFile", v: File | null): void }>()

const signSize = ref<"tiny" | "medium" | "large">("medium")
const brightness = ref<"low" | "normal" | "high" | "max">("normal")
const imageSize = ref<number>(32)

const skipTransparentPixels = ref<boolean>(true)

const outputFilename = ref<string>("Image")

const status = ref<string | null>(null)
const canCreate = computed(() => !!props.imageFile)

async function createBlueprint() {
  if (!props.imageFile) return
  status.value = "Processing..."
  try {
    const options = {
      signSize: signSize.value,
      brightness: brightness.value,
      imageSize: imageSize.value,
      skipTransparentPixels: skipTransparentPixels.value
    }

    const result = await processImageFileAndGenerate(props.imageFile, options)

    downloadArrayBuffer(result.sbp, outputFilename.value + ".sbp")
    downloadArrayBuffer(result.sbpcfg, outputFilename.value + ".sbpcfg")

    status.value = "Done — downloads started."
  } catch (err) {
    console.error(err)
    status.value = "Error: " + (err instanceof Error ? err.message : String(err))
  }
}

function downloadArrayBuffer(buffer: ArrayBuffer, filename: string) {
  const blob = new Blob([buffer], { type: "application/octet-stream" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="flex flex-col bg-[#1b1b1b] text-gray-100 rounded-xl p-6 gap-4 w-[25rem] shadow-lg">
    <h2 class="text-2xl font-semibold text-center mb-2">Blueprint Configurator</h2>

    <!-- Sign Size -->
    <div class="flex flex-col gap-2">
      <label class="text-sm font-semibold">Sign Size</label>
      <select v-model="signSize"
        class="bg-[#2a2a2a]  border border-[#196359]  rounded-md px-3 py-2 focus:border-[#1ea896] transition-color duration-200 ease-in-out">
        <option value="tiny">Tiny</option>
        <option value="medium">Medium</option>
        <option value="large">Large</option>
      </select>
    </div>

    <!-- Brightness -->
    <div class="flex flex-col gap-2">
      <label class="text-sm font-semibold">Brightness</label>
      <h6 class="text-sm text-gray-500">not the sign brightness but the image itself</h6>
      <select v-model="brightness"
        class="bg-[#2a2a2a] border border-[#196359] rounded-md px-3 py-2 focus:border-[#1ea896] transition-color duration-200 ease-in-out">
        <option value="low">Low</option>
        <option value="normal">Normal</option>
        <option value="high">High</option>
        <option value="max">Max</option>
      </select>
    </div>

    <!-- Image Size -->
    <div class="flex flex-col gap-2">
      <label class="text-sm font-semibold">Image Size: {{ imageSize }}px</label>
      <input type="range" min="1" max="144" v-model="imageSize" class="accent-[#1ea896]" />
    </div>

    <!-- Output Filename-->
    <div class="flex flex-col gap-2">
      <label class="text-sm font-semibold">Output Filename</label>
      <input type="text"
        class="flex-1 bg-[#2a2a2a] border border-[#196359] rounded-md px-3 py-2 outline-none focus:border-[#1ea896] transition-color duration-200 ease-in-out"
        v-model="outputFilename" />
    </div>
    <!-- Small settings(Toggles) -->
    <div class="grid gap-2  grid-cols-2">
      <Toggle v-model="skipTransparentPixels" label="Enable Feature" />
    </div>

    <!-- Create Button -->
    <div>
      <label class="text-gray-500" v-if="!canCreate"> Select Image</label>
      <button class="w-full py-3 rounded-md font-semibold text-lg transition-colors" :disabled="!canCreate"
        :class="canCreate ? ' bg-[#1ea896] hover:bg-[#21c7aa]' : 'bg-red-700 cursor-not-allowed'"
        @click="createBlueprint">
        Create Blueprint
      </button>
    </div>

    <!-- Status -->
    <span v-if="status" class="text-sm text-gray-400 break-words mt-2">{{ status }}</span>
  </div>
</template>
