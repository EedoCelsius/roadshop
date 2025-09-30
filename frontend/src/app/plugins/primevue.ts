import type { App } from 'vue'

import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Chip from 'primevue/chip'
import Dialog from 'primevue/dialog'
import Divider from 'primevue/divider'
import Dropdown from 'primevue/dropdown'
import ProgressSpinner from 'primevue/progressspinner'
import Tag from 'primevue/tag'
import Tooltip from 'primevue/tooltip'

export const installPrimeVue = (app: App) => {
  app.use(PrimeVue, {
    ripple: true,
    theme: {
      preset: Aura,
      options: {
        darkModeSelector: '.app-dark',
        cssLayer: {
          name: 'primevue',
          order: 'tailwind-base,primevue,tailwind-utilities',
        },
      },
    },
  })

  app.component('Dialog', Dialog)
  app.component('Button', Button)
  app.component('Card', Card)
  app.component('Tag', Tag)
  app.component('Chip', Chip)
  app.component('Divider', Divider)
  app.component('Dropdown', Dropdown)
  app.component('ProgressSpinner', ProgressSpinner)

  app.directive('tooltip', Tooltip)
}
