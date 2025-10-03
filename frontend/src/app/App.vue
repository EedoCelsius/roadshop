<template>
  <div class="flex min-h-screen flex-col bg-brand-highlight/40">
    <main class="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>
