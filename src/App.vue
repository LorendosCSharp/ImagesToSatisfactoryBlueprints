<script setup lang="ts">
import { ref } from 'vue';
import Configurator from './components/Configurator.vue';
import Upload from './components/Upload.vue';

const sharedImagePath = ref<string | null>(null)
</script>

<template>
  <div class="h-screen w-screen bg-[#121212] flex flex-col items-center justify-center gap-6 p-6">
    <h1 class="text-3xl font-bold text-gray-100">Image to Satisfactory Blueprint</h1>
    <div class="flex flex-col sm:flex-row gap-8">
      <Upload v-model:imagePath="sharedImagePath" />
      <Configurator v-model:imagePath="sharedImagePath" />
    </div>
  </div>
</template>



