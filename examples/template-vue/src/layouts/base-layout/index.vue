<template>
  <div>
    <header>头部</header>
    <RouterView />
    <footer>底部</footer>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';

defineOptions({
  name: 'DefaultLayout'
});
</script>

<style scoped></style>
