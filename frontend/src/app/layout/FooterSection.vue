<script setup lang="ts">
import { computed } from 'vue'

import { useI18nStore } from '@/localization/store'

const i18nStore = useI18nStore()
const currentYear = new Date().getFullYear().toString()

const footerCopy = computed(() => i18nStore.t('footer.message').replace('{year}', currentYear))
</script>

<template>
  <footer class="surface-section border-top-1 border-200 py-5 text-center text-sm text-color-secondary">
    {{ footerCopy }}
  </footer>
</template>
