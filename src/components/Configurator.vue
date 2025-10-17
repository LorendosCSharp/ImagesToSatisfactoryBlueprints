<script setup lang="ts">
import { ref } from 'vue'
const props = defineProps<{ imagePath: string | null }>()
const emit = defineEmits<{ (e: 'update:imagePath', value: string | null): void }>()
const outputPathG = ref<string|null>(null);


function convertImageToBP() {
   // <- note the .value


  window.electronAPI.proccessImage().then((outputPath: string | null) => {
    if (outputPath) {
      outputPathG.value = outputPath
    }
  })
}
</script>

<template>
  <div class="flex h-[65dvh] gap-4 flex-col">
    <button class="w-full h-[6rem]" @click="convertImageToBP">Create</button>
    <span v-if="outputPathG">Output: {{ outputPathG }}</span>
  </div>
</template>
