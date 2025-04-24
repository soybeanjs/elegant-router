<script setup lang="ts">
import { useRoute } from 'vue-router';

const route = useRoute('ListId');
</script>

<template>
  <div>list-id: {{ route.params.id }}</div>
</template>

<style scoped></style>
