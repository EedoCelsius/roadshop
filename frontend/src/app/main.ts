import { createApp } from 'vue'
import type { Pinia } from 'pinia'

import App from '@/app/App.vue'
import { createAppPinia } from '@/app/providers/createPinia'
import { installPrimeVue } from '@/app/plugins/primevue'
import { useI18nStore } from '@/localization/store'

const initializeLocalization = async (pinia: Pinia) => {
  const i18nStore = useI18nStore(pinia)
  await i18nStore.initialize()
}

export const bootstrapApp = async () => {
  const app = createApp(App)
  const pinia = createAppPinia()

  app.use(pinia)
  installPrimeVue(app)

  await initializeLocalization(pinia)

  app.mount('#app')
}
