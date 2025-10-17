<script setup lang="ts">
import { ref } from 'vue';
import Configurator from './components/Configurator.vue';
import Upload from './components/Upload.vue';

const sharedImagePath = ref<string | null>(null)
</script>

<template>

  <div  class="h-screen w-screen p-[1rem]">
    <div class="flex grid gap-4 justify-center">
      <Upload class="h-[30dvh]"v-model:imagePath="sharedImagePath"></Upload>
      <Configurator v-model:imagePath="sharedImagePath"></Configurator>
    </div>
  </div>
</template>


