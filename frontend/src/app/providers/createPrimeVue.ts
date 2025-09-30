import type { App } from 'vue'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import Tooltip from 'primevue/tooltip'
import Ripple from 'primevue/ripple'
import Aura from '@primevue/themes/aura'

export const registerPrimeVue = (app: App) => {
  app.use(PrimeVue, {
    ripple: true,
    theme: {
      preset: Aura,
      options: {
        prefix: 'p',
      },
    },
  })

  app.use(ToastService)
  app.directive('tooltip', Tooltip)
  app.directive('ripple', Ripple)
}
