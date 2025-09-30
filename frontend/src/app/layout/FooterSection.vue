<script setup lang="ts">
import { computed } from 'vue'

import { useI18nStore } from '@/localization/store'

const i18nStore = useI18nStore()
const currentYear = new Date().getFullYear().toString()

const footerCopy = computed(() => i18nStore.t('footer.message').replace('{year}', currentYear))
</script>

<template>
  <footer class="border-t border-slate-200 bg-white/90 py-6 text-center text-xs text-slate-500">
    {{ footerCopy }}
  </footer>
</template>
