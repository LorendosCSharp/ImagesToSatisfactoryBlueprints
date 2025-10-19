<script setup lang="ts">
import { defineProps, defineEmits, ref, watch } from 'vue';

const props = defineProps<{
    modelValue: boolean;  // v-model binding
    label?: string;       // optional label
}>();

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
}>();

// internal reactive state
const checked = ref(props.modelValue);

watch(checked, (newVal) => {
    emit('update:modelValue', newVal);
});

watch(() => props.modelValue, (newVal) => {
    checked.value = newVal;
});
</script>

<template>
    <label class="flex items-center cursor-pointer select-none">
        <div class="relative">
            <!-- hidden checkbox -->
            <input type="checkbox" class="sr-only" v-model="checked" />
            <!-- track -->
            <div
                :class="['w-12 h-6 rounded-full transition-colors duration-300 ease-in-out', checked ? 'bg-[#1ea896]' : 'bg-gray-300']">
            </div>
            <!-- knob -->
            <div
                :class="['absolute top-0 left-0 w-6 h-6 bg-white rounded-full shadow transform transition-transform duration-300 ease-in-out', checked ? 'translate-x-6' : 'translate-x-0']">
            </div>
        </div>
        <span v-if="label" class="ml-3 text-gray-800 dark:text-white font-medium">{{ label }}</span>
    </label>
</template>
