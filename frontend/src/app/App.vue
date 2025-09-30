<script setup lang="ts">
import HeroSection from '@/app/layout/HeroSection.vue'
import FooterSection from '@/app/layout/FooterSection.vue'
import Experience from '@/payments/components/Experience.vue'
import Toast from 'primevue/toast'
</script>

<template>
  <div class="flex min-h-screen flex-col bg-gradient-to-b from-white via-roadshop-highlight to-white">
    <Toast position="top-right" />
    <HeroSection />
    <main class="mx-auto mt-16 w-full max-w-5xl flex-1 px-6 pb-24">
      <Experience />
    </main>
    <FooterSection />
  </div>
</template>
