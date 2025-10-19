<template>
  <div class="w-[25rem] h-[25rem] relative rounded-xl overflow-hidden shadow-lg">
    <button class="w-full h-full bg-[#2b2b2b] hover:bg-[#333] text-gray-300 rounded-xl flex items-center justify-center"
      @click="pickFile">
      <img v-if="preview" :src="preview" alt="Selected" class="absolute inset-0 w-full h-full object-cover" />
      <span v-if="!preview" class="font-semibold text-lg">Select Image</span>
    </button>
    <input id="file-input" type="file" accept="image/*" class="hidden" @change="onFileChange" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from "vue"

const props = defineProps<{ imageFile: File | null }>()
const emit = defineEmits<{ (e: "update:imageFile", v: File | null): void }>()

const preview = ref<string | null>(null)

watch(() => props.imageFile, (f) => {
  if (!f) {
    preview.value = null
    return
  }
  preview.value = URL.createObjectURL(f)
})

function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0] ?? null
  emit("update:imageFile", file)
}

function pickFile() {
  const input = document.getElementById("file-input") as HTMLInputElement
  input.click()
}
</script>
