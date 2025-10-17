<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{ imagePath: string | null }>()


const outputPathG = ref<string | null>(null)
const signSize = ref<'tiny' | 'medium' | 'large'>('medium')
const brightness = ref<'low' | 'normal' | 'high' | 'max'>('normal')
const imageSize = ref<number>(96)
const outputDir = ref<string>('Desktop')

const canCreate = computed(() => !!props.imagePath)

function chooseOutputDir() {
  window.electronAPI.selectDir?.().then((dir) => {
    if (dir) outputDir.value = dir
  })
}

function convertImageToBP() {
  if (!props.imagePath) return
  const options = {
    signSize: signSize.value,
    brightness: brightness.value,
    imageSize: imageSize.value,
    outputDir: outputDir.value,
  }
  window.electronAPI.proccessImage(props.imagePath, options).then((outputPath: string | null) => {
    if (outputPath) outputPathG.value = outputPath
  })
}
</script>

<template>
  <div class="flex flex-col bg-[#1b1b1b] text-gray-100 rounded-xl p-6 gap-4 w-[25rem] shadow-lg">
    <h2 class="text-2xl font-semibold text-center mb-2">Blueprint Configurator</h2>

    <!-- Sign Size -->
    <div class="flex flex-col gap-2">
      <label class="text-sm font-semibold">Sign Size</label>
      <select v-model="signSize" class="bg-gray-800 border border-gray-600 rounded-md px-3 py-2">
        <option value="tiny">Tiny</option>
        <option value="medium">Medium</option>
        <option value="large">Large</option>
      </select>
    </div>

    <!-- Brightness -->
    <div class="flex flex-col gap-2">
      <label class="text-sm font-semibold">Brightness</label>
      <h6 class="text-sm text-gray-500">not the sign brightness but the image itself</h6>
      <select v-model="brightness" class="bg-gray-800 border border-gray-600 rounded-md px-3 py-2">
        <option value="low">Low</option>
        <option value="normal">Normal</option>
        <option value="high">High</option>
        <option value="max">Max</option>
      </select>
    </div>

    <!-- Image Size -->
    <div class="flex flex-col gap-2">
      <label class="text-sm font-semibold">Image Size: {{ imageSize }}px</label>
      <input
        type="range"
        min="1"
        max="144"
        v-model="imageSize"
        class="accent-[#1ea896]"
      />
    </div>

    <!-- Output Folder -->
    <div class="flex flex-col gap-2">
      <label class="text-sm font-semibold">Output Directory</label>
      <div class="flex gap-2 items-center">
        <input
          type="text"
          readonly
          class="flex-1 bg-gray-800 border border-gray-600 rounded-md px-3 py-2"
          :value="outputDir"
        />
        <button
          class="bg-[#2b2b2b] hover:bg-[#333] px-4 py-2 rounded-md border border-gray-600 text-sm"
          @click="chooseOutputDir"
        >
          Browse
        </button>
      </div>
    </div>

    <!-- Create Button -->
    <div>     
        <label class="text-gray-500 " v-if="!canCreate"> Select Image</label>
        <button
          class="w-full py-3 rounded-md font-semibold text-lg transition-colors"
          :disabled="!canCreate"
          :class="canCreate ? 'bg-[#1ea896] hover:bg-[#21c7aa]' : 'bg-red-700 cursor-not-allowed'"
          @click="convertImageToBP"
        >
          Create Blueprint
        </button></div>

    <span v-if="outputPathG" class="text-sm text-gray-400 break-words mt-2">
      Output: {{ outputPathG }}
    </span>
  </div>
</template>
