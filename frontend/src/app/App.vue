<script setup lang="ts">
import HeroSection from '@/app/layout/HeroSection.vue'
import FooterSection from '@/app/layout/FooterSection.vue'
import PaymentExperience from '@/features/payments/components/PaymentExperience.vue'
</script>

<template>
  <div class="flex min-h-screen flex-col bg-gradient-to-b from-white via-roadshop-highlight to-white">
    <HeroSection />
    <main class="mx-auto mt-16 w-full max-w-5xl flex-1 px-6 pb-24">
      <PaymentExperience />
    </main>
    <FooterSection />
  </div>
</template>
