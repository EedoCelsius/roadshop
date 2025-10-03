import { createApp } from 'vue'
import type { Pinia } from 'pinia'

import App from '@/app/App.vue'
import { createAppPinia } from '@/app/providers/createPinia'
import { createAppRouter } from '@/app/providers/createRouter'
import { useI18nStore } from '@/localization/store'

const initializeLocalization = async (pinia: Pinia) => {
  const i18nStore = useI18nStore(pinia)
  await i18nStore.initialize()
}

export const bootstrapApp = async () => {
  const app = createApp(App)
  const pinia = createAppPinia()
  const router = createAppRouter()

  app.use(pinia)
  app.use(router)

  await initializeLocalization(pinia)

  await router.isReady()

  app.mount('#app')
}
