import { computed } from 'vue'
import { storeToRefs } from 'pinia'

import { getPaymentLayoutConfig } from '@/payments/data/layout'
import type { PaymentCategory, PaymentMethod } from '@/payments/types'
import { useI18nStore } from '@/localization/store'
import { usePaymentStore } from '@/payments/stores/payment.store'

export type LocalizedPaymentMethod = PaymentMethod & {
  name: string
  supportedCurrencies: string[]
  isSelected: boolean
}

export type LocalizedPaymentSection = {
  category: PaymentCategory
  methods: LocalizedPaymentMethod[]
}

export const useLocalizedSections = () => {
  const paymentStore = usePaymentStore()
  const i18nStore = useI18nStore()
  const { locale } = storeToRefs(i18nStore)
  const { methodsByCategory, selectedMethodId } = storeToRefs(paymentStore)

  const sections = computed<LocalizedPaymentSection[]>(() => {
    const layoutConfig = getPaymentLayoutConfig(locale.value)

    return layoutConfig.sectionOrder.map((category) => {
      const methods = [...(methodsByCategory.value[category] ?? [])]
      const orderedIds = layoutConfig.methodOrder?.[category]

      if (orderedIds) {
        const fallbackIndex = Number.MAX_SAFE_INTEGER
        methods.sort((a, b) => {
          const aIndex = orderedIds.indexOf(a.id)
          const bIndex = orderedIds.indexOf(b.id)

          return (aIndex === -1 ? fallbackIndex : aIndex) - (bIndex === -1 ? fallbackIndex : bIndex)
        })
      }

      return {
        category,
        methods: methods
          .map((method) => ({
            ...method,
            name: i18nStore.t(`payment.${method.id}.name`),
            isSelected: method.id === selectedMethodId.value,
          }))
          .filter((method) => method.name),
      }
    })
  })

  return {
    sections,
  }
}
