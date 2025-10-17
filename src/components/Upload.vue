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
  <div class="w-[25rem] h-[25rem] relative rounded-xl overflow-hidden shadow-lg">
    <button
      class="w-full h-full bg-[#2b2b2b] hover:bg-[#333] text-gray-300 rounded-xl flex items-center justify-center"
      @click="pickImage"
    >
      <img
        v-if="props.imagePath"
        :src="props.imagePath"
        alt="Selected"
        class="absolute inset-0 w-full h-full object-cover"
      />
      <span v-if="!props.imagePath" class="font-semibold text-lg">Select Image</span>
    </button>
  </div>
</template>

