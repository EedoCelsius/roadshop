<script setup lang="ts">
import OptionCard from '@/payments/components/OptionCard.vue'
import type { LocalizedPaymentSection } from '@/payments/composables/useLocalizedSections'

interface Props {
  section: LocalizedPaymentSection
  title: string
}

defineOptions({
  name: 'PaymentMethodSection',
})

const { section, title } = defineProps<Props>()

const emit = defineEmits<{
  select: [string]
}>()
</script>

<template>
  <section class="flex flex-col gap-5">
    <div class="flex flex-col gap-2">
      <h2 class="text-2xl font-semibold text-brand-primary">{{ title }}</h2>
    </div>
    <div class="grid gap-3 md:grid-cols-2">
      <OptionCard
        v-for="method in section.methods"
        :key="method.id"
        :name="method.name"
        :supported-currencies="method.supportedCurrencies"
        :icons="method.icons"
        :is-selected="method.isSelected"
        :category="method.category"
        @select="emit('select', method.id)"
      />
    </div>
  </section>
</template>
