<script setup lang="ts">
import FooterSection from '@/app/layout/FooterSection.vue'
import Experience from '@/payments/components/Experience.vue'
</script>

<template>
  <div class="flex min-h-screen flex-col bg-roadshop-highlight/40">
    <main class="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
      <Experience />
    </main>
    <FooterSection />
  </div>
</template>
