<script setup lang="ts">
import HeroSection from '@/app/layout/HeroSection.vue'
import FooterSection from '@/app/layout/FooterSection.vue'
import Experience from '@/payments/components/Experience.vue'
</script>

<template>
  <div class="flex min-h-screen flex-col bg-gradient-to-b from-white via-roadshop-highlight to-white">
    <HeroSection />
    <main class="mx-auto mt-8 w-full max-w-5xl flex-1 px-6 pb-8">
      <Experience />
    </main>
    <FooterSection />
  </div>
</template>
