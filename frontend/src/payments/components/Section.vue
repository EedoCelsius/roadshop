<script setup lang="ts">
import OptionCard from '@/payments/components/OptionCard.vue'
import type { LocalizedPaymentSection } from '@/payments/composables/useLocalizedSections'

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
  <section class="flex flex-column gap-4">
    <div class="flex flex-column gap-2">
      <h2 class="m-0 text-2xl font-semibold text-primary">{{ title }}</h2>
      <p class="m-0 text-sm text-color-secondary line-height-3">{{ description }}</p>
    </div>
    <div class="grid gap-4 md:gap-5">
      <div v-for="method in section.methods" :key="method.id" class="col-12 md:col-6">
        <OptionCard
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
    </div>
  </section>
</template>
