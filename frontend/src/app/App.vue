<script setup lang="ts">
import HeroSection from '@/app/layout/HeroSection.vue'
import FooterSection from '@/app/layout/FooterSection.vue'
import Experience from '@/payments/components/Experience.vue'
import Toast from 'primevue/toast'
</script>

<template>
  <div class="flex min-h-screen flex-col surface-ground">
    <Toast position="bottom-right" />
    <HeroSection />
    <main class="flex-1">
      <Experience />
    </main>
    <FooterSection />
  </div>
</template>
