<script setup lang="ts">
import { ref } from "vue"
import Upload from "./components/Upload.vue"
import Configurator from "./components/Configurator.vue"


const sharedImageFile = ref<File | null>(null)
</script>


<template>
  <div class="h-screen w-screen bg-[#121212] flex flex-col items-center justify-center gap-6 p-6">
    <h1 class="text-3xl font-bold text-gray-100">Image to Satisfactory Blueprint (Web)</h1>
    <div class="flex flex-col sm:flex-row gap-8 items-center">
      <Upload v-model:imageFile="sharedImageFile" />
      <Configurator v-model:imageFile="sharedImageFile" />
    </div>
  </div>
</template>
