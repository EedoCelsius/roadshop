<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { loadStripe, type Stripe, type StripeElements, type StripePaymentElement } from '@stripe/stripe-js'

import DialogCloseFull from '@/shared/components/DialogCloseFull.vue'
import { usePaymentInfoStore } from '@/payments/stores/paymentInfo.store'
import { useI18nStore } from '@/localization/store'

const emit = defineEmits<{ close: [] }>()

const paymentInfoStore = usePaymentInfoStore()
const i18nStore = useI18nStore()

const isVisible = ref(false)
const isProcessing = ref(false)
const submissionError = ref<string | null>(null)
const submissionSuccess = ref<string | null>(null)
const formError = ref<string | null>(null)

const stripeInstance = ref<Stripe | null>(null)
const elements = ref<StripeElements | null>(null)
const paymentElement = ref<StripePaymentElement | null>(null)
const elementContainer = ref<HTMLDivElement | null>(null)

const methodError = computed(() => paymentInfoStore.errors.card ?? null)
const isLoading = computed(() => paymentInfoStore.isMethodLoading('card'))
const stripeInfo = computed(() => paymentInfoStore.stripeCardInfo)

const hasDemoKeys = computed(() => {
  const info = stripeInfo.value
  if (!info) {
    return true
  }

  const normalizedPublishable = info.publishableKey.trim().toUpperCase()
  const normalizedSecret = info.clientSecret.trim().toUpperCase()

  return (
    !normalizedPublishable.length ||
    !normalizedSecret.length ||
    normalizedPublishable.includes('PLACEHOLDER') ||
    normalizedSecret.includes('PLACEHOLDER')
  )
})

const destroyElement = () => {
  if (paymentElement.value) {
    paymentElement.value.unmount()
    paymentElement.value = null
  }

  elements.value = null
}

const initializeElement = async () => {
  formError.value = null
  submissionError.value = null
  submissionSuccess.value = null

  if (hasDemoKeys.value) {
    return
  }

  const info = stripeInfo.value
  const container = elementContainer.value

  if (!info || !container) {
    return
  }

  destroyElement()

  try {
    stripeInstance.value = await loadStripe(info.publishableKey)

    if (!stripeInstance.value) {
      formError.value = i18nStore.t('dialogs.stripeCard.errors.load')
      return
    }

    elements.value = stripeInstance.value.elements({
      clientSecret: info.clientSecret,
      appearance: (info.appearance as Record<string, unknown> | undefined) ?? { theme: 'stripe' },
    })

    paymentElement.value = elements.value.create('payment')
    paymentElement.value.mount(container)
  } catch (error) {
    formError.value =
      error instanceof Error ? error.message : i18nStore.t('dialogs.stripeCard.errors.load')
  }
}

const confirmPayment = async () => {
  const info = stripeInfo.value

  if (!stripeInstance.value || !elements.value || !info) {
    return
  }

  submissionError.value = null
  submissionSuccess.value = null
  isProcessing.value = true

  try {
    const result = await stripeInstance.value.confirmPayment({
      elements: elements.value,
      confirmParams: {
        return_url: info.returnUrl ?? window.location.href,
      },
      redirect: 'if_required',
    })

    if (result.error) {
      submissionError.value = result.error.message ?? i18nStore.t('dialogs.stripeCard.errors.generic')
      return
    }

    submissionSuccess.value = i18nStore.t('dialogs.stripeCard.success')
  } catch (error) {
    submissionError.value =
      error instanceof Error ? error.message : i18nStore.t('dialogs.stripeCard.errors.generic')
  } finally {
    isProcessing.value = false
  }
}

const closeDialog = () => {
  isVisible.value = false
  destroyElement()
  emit('close')
}

const run = async (): Promise<boolean> => {
  submissionError.value = null
  submissionSuccess.value = null
  formError.value = null
  isProcessing.value = false

  isVisible.value = true
  await nextTick()

  const ready = await paymentInfoStore.ensureMethodInfo('card')

  if (ready) {
    await nextTick()
    await initializeElement()
  }

  return ready
}

watch(
  () => stripeInfo.value?.clientSecret,
  async () => {
    if (!isVisible.value) {
      return
    }

    await nextTick()
    await initializeElement()
  },
)

onBeforeUnmount(() => {
  destroyElement()
})

defineExpose({
  run,
})
</script>

<template>
  <DialogCloseFull
    v-if="isVisible"
    :title="i18nStore.t('dialogs.stripeCard.title')"
    :description="i18nStore.t('dialogs.stripeCard.description')"
    @close="closeDialog"
  >
    <div class="space-y-4">
      <p class="rounded-xl bg-brand-highlight/60 px-4 py-3 text-sm text-brand-primary/80" v-html="i18nStore.t('dialogs.stripeCard.testNotice')"></p>

      <div
        v-if="methodError"
        class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        {{ methodError }}
      </div>

      <div
        v-else-if="isLoading"
        class="flex items-center justify-center rounded-xl border border-dashed border-brand-primary/30 px-4 py-12 text-sm text-brand-primary/70"
      >
        {{ i18nStore.t('status.loading.methods') }}
      </div>

      <div
        v-else-if="hasDemoKeys"
        class="rounded-xl border border-brand-primary/20 bg-brand-highlight/40 px-4 py-3 text-sm text-brand-primary/80"
      >
        {{ i18nStore.t('dialogs.stripeCard.setupHint') }}
      </div>

      <div v-else class="space-y-4">
        <div
          class="rounded-xl border border-slate-200 bg-white px-4 py-5 shadow-inner"
        >
          <div ref="elementContainer"></div>
        </div>

        <div v-if="formError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {{ formError }}
        </div>

        <button
          type="button"
          class="w-full rounded-xl bg-brand-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-primary/90 disabled:cursor-not-allowed disabled:bg-brand-primary/50"
          :disabled="isProcessing"
          @click="confirmPayment"
        >
          <span v-if="isProcessing">{{ i18nStore.t('dialogs.stripeCard.processing') }}</span>
          <span v-else>{{ i18nStore.t('dialogs.stripeCard.submit') }}</span>
        </button>

        <p v-if="submissionError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {{ submissionError }}
        </p>

        <p v-if="submissionSuccess" class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {{ submissionSuccess }}
        </p>
      </div>
    </div>
  </DialogCloseFull>
</template>

<style scoped>
button {
  transition: background-color 0.2s ease;
}
</style>
