<script setup lang="ts">
import PaymentOptionCard from '@/features/payments/components/PaymentOptionCard.vue'
import type { LocalizedPaymentSection } from '@/features/payments/composables/useLocalizedSections'

interface Props {
  section: LocalizedPaymentSection
  title: string
  description: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  select: [string]
}>()
</script>

<template>
  <section class="flex flex-col gap-6">
    <div class="flex flex-col gap-2">
      <h2 class="text-2xl font-semibold text-roadshop-primary">{{ title }}</h2>
      <p class="text-sm text-slate-500">{{ description }}</p>
    </div>
    <div class="grid gap-6 md:grid-cols-2">
      <PaymentOptionCard
        v-for="method in section.methods"
        :key="method.id"
        :name="method.name"
        :description="method.description"
        :supported-currencies="method.supportedCurrencies"
        :provider="method.provider"
        :status="method.status"
        :icons="method.icons"
        :is-selected="method.isSelected"
        :currency="method.currency"
        @select="emit('select', method.id)"
      />
    </div>
  </section>
</template>
