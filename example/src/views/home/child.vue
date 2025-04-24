<script setup lang="ts">
import { useRoute } from 'vue-router';

const route = useRoute('HomeChild');
console.log('route: ', route);
</script>

<template>
  <div>child</div>
</template>

<style scoped></style>
