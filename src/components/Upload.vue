<script setup lang="ts">

const props = defineProps<{ imagePath: string | null }>()
const emit = defineEmits<{ (e: 'update:imagePath', value: string | null): void }>()

function pickImage() {
  window.electronAPI.selectImage().then((dataUrl) => {
    if (dataUrl){
        emit('update:imagePath', dataUrl)
        console.log("Path was set",dataUrl)
    }
  })
}

</script>

<template>
  <div class="w-[30dvh] pb-4 relative">
    <button
      class="w-full h-full rounded-md overflow-hidden relative flex items-center justify-center bg-gray-200"
      @click="pickImage"
    >
      <img
        v-if="props.imagePath"
        :src="props.imagePath"
        alt="Selected"
        class="absolute inset-0 w-full h-full object-cover"
      />
      <span v-if="!imagePath" class="text-white font-bold z-10">Upload</span>
    </button>
  </div>
</template>
