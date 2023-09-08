<template>
  <div>
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';

defineOptions({
  name: 'BlankLayout'
});
</script>

<style scoped></style>
