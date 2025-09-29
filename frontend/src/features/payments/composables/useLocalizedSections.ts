import { computed } from 'vue'
import { storeToRefs } from 'pinia'

import { getPaymentLayoutConfig } from '@/features/payments/data/paymentLayout'
import type { PaymentMethod } from '@/features/payments/types'
import { useI18nStore } from '@/localization/store'
import { usePaymentStore } from '@/features/payments/stores/payment.store'

export type LocalizedPaymentMethod = PaymentMethod & {
  name: string
  description: string
  provider: string
  isSelected: boolean
}

export type LocalizedPaymentSection = {
  currency: PaymentMethod['currency']
  methods: LocalizedPaymentMethod[]
}

export const useLocalizedSections = () => {
  const paymentStore = usePaymentStore()
  const i18nStore = useI18nStore()
  const { locale } = storeToRefs(i18nStore)
  const { methodsByCurrency, selectedMethodId } = storeToRefs(paymentStore)

  const sections = computed<LocalizedPaymentSection[]>(() => {
    const layoutConfig = getPaymentLayoutConfig(locale.value)

    return layoutConfig.sectionOrder.map((currency) => {
      const methods = [...(methodsByCurrency.value[currency] ?? [])]
      const orderedIds = layoutConfig.methodOrder?.[currency]

      if (orderedIds) {
        const fallbackIndex = Number.MAX_SAFE_INTEGER
        methods.sort((a, b) => {
          const aIndex = orderedIds.indexOf(a.id)
          const bIndex = orderedIds.indexOf(b.id)

          return (aIndex === -1 ? fallbackIndex : aIndex) - (bIndex === -1 ? fallbackIndex : bIndex)
        })
      }

      return {
        currency,
        methods: methods.map((method) => ({
          ...method,
          name: i18nStore.t(`payment.${method.id}.name`, method.name),
          description: i18nStore.t(`payment.${method.id}.description`, method.description),
          provider: i18nStore.t(`payment.${method.id}.provider`, method.provider),
          isSelected: method.id === selectedMethodId.value,
        })),
      }
    })
  })

  return {
    sections,
  }
}
