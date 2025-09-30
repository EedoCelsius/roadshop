import { createApp } from 'vue'
import type { Pinia } from 'pinia'

import Aura from '@primevue/themes/aura'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import Tooltip from 'primevue/tooltip'

import App from '@/app/App.vue'
import { createAppPinia } from '@/app/providers/createPinia'
import { useI18nStore } from '@/localization/store'

const initializeLocalization = async (pinia: Pinia) => {
  const i18nStore = useI18nStore(pinia)
  await i18nStore.initialize()
}

export const bootstrapApp = async () => {
  const app = createApp(App)
  const pinia = createAppPinia()

  app.use(pinia)
  app.use(PrimeVue, {
    ripple: true,
    theme: {
      preset: Aura,
    },
  })
  app.use(ToastService)
  app.directive('tooltip', Tooltip)

  await initializeLocalization(pinia)

  app.mount('#app')
}
