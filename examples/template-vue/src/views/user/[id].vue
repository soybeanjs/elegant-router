<script setup lang="ts">
interface Props {
  id: string;
}

defineProps<Props>();
</script>

<template>
  <div>User {{ id }}</div>
</template>

<style scoped></style>
