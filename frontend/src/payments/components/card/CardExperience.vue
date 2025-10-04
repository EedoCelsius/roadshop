<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import {
  loadStripe,
  type Stripe,
  type StripeElements,
  type StripePaymentElement,
} from '@stripe/stripe-js'

import DialogBase from '@/shared/components/DialogBase.vue'
import LoadingOverlay from '@/shared/components/LoadingOverlay.vue'
import { useI18nStore } from '@/localization/store'
import {
  createStripePaymentIntent,
  type StripePaymentIntentPayload,
} from '@/payments/services/stripePaymentService'

type StripePaymentIntentResolved = StripePaymentIntentPayload & {
  clientSecret: string
  publishableKey: string
}

const emit = defineEmits<{ close: [] }>()

const i18nStore = useI18nStore()

const isVisible = ref(false)
const isLoading = ref(false)
const isSubmitting = ref(false)
const isMockResponse = ref(false)
const errorMessage = ref<string | null>(null)
const statusMessage = ref<string | null>(null)
const currentCurrency = ref<string | null>(null)
const paymentElementContainer = ref<HTMLDivElement | null>(null)

const stripeRef = ref<Stripe | null>(null)
const elementsRef = ref<StripeElements | null>(null)
let paymentElement: StripePaymentElement | null = null

const dialogTitle = computed(() => i18nStore.t('dialogs.cardPayment.title'))
const dialogDescription = computed(() =>
  i18nStore.t('dialogs.cardPayment.description').replace(
    '{currency}',
    currentCurrency.value ?? '',
  ),
)
const loadingMessage = computed(() => i18nStore.t('dialogs.cardPayment.loading'))
const mockNotice = computed(() => i18nStore.t('dialogs.cardPayment.mockNotice'))
const testModeNotice = computed(() => i18nStore.t('dialogs.cardPayment.testModeNotice'))
const submitLabel = computed(() => i18nStore.t('dialogs.cardPayment.submit'))
const successMessage = computed(() => i18nStore.t('dialogs.cardPayment.success'))
const defaultErrorMessage = computed(() => i18nStore.t('dialogs.cardPayment.error'))
const missingCurrencyMessage = computed(() => i18nStore.t('dialogs.cardPayment.missingCurrency'))

const resetStripe = () => {
  if (paymentElement) {
    paymentElement.unmount()
    paymentElement = null
  }

  elementsRef.value = null
  stripeRef.value = null
}

const closeDialog = () => {
  resetStripe()
  isVisible.value = false
  emit('close')
}

const mountPaymentElement = () => {
  if (!paymentElementContainer.value || !elementsRef.value || paymentElement) {
    return
  }

  paymentElement = elementsRef.value.create('payment', { layout: 'tabs' })
  paymentElement.mount(paymentElementContainer.value)
}

watch([paymentElementContainer, elementsRef], () => {
  if (isVisible.value) {
    mountPaymentElement()
  }
})

const initializeStripe = async (payload: StripePaymentIntentResolved): Promise<void> => {
  const stripe = await loadStripe(payload.publishableKey)

  if (!stripe) {
    throw new Error('Failed to initialize Stripe with the provided publishable key.')
  }

  const elements = stripe.elements({
    clientSecret: payload.clientSecret,
    appearance: { theme: 'stripe' },
  })

  stripeRef.value = stripe
  elementsRef.value = elements
  mountPaymentElement()
}

const ensureStripePayload = (
  payload: StripePaymentIntentPayload,
): StripePaymentIntentResolved | null => {
  if (!payload || !payload.clientSecret || !payload.publishableKey) {
    return null
  }

  return {
    clientSecret: payload.clientSecret,
    publishableKey: payload.publishableKey,
    isMock: payload.isMock ?? false,
    message: payload.message,
  }
}

const run = async (currency: string | null): Promise<boolean> => {
  resetStripe()
  isMockResponse.value = false
  errorMessage.value = null
  statusMessage.value = null

  if (!currency) {
    errorMessage.value = missingCurrencyMessage.value
    return false
  }

  currentCurrency.value = currency
  isVisible.value = true
  isLoading.value = true

  try {
    const payload = await createStripePaymentIntent(currency)
    const normalizedPayload = ensureStripePayload(payload)

    if (payload.isMock || !normalizedPayload) {
      isMockResponse.value = true
      statusMessage.value = payload.message ?? mockNotice.value
      return true
    }

    await initializeStripe(normalizedPayload)
    statusMessage.value = normalizedPayload.message ?? testModeNotice.value
    return true
  } catch (error) {
    const message = error instanceof Error ? error.message : defaultErrorMessage.value
    errorMessage.value = message
    return false
  } finally {
    isLoading.value = false
  }
}

defineExpose({
  run,
})

const submitPayment = async () => {
  if (!stripeRef.value || !elementsRef.value) {
    return
  }

  isSubmitting.value = true
  errorMessage.value = null

  const { error } = await stripeRef.value.confirmPayment({
    elements: elementsRef.value,
    confirmParams: {
      return_url: window.location.href,
    },
    redirect: 'if_required',
  })

  if (error) {
    errorMessage.value = error.message ?? defaultErrorMessage.value
  } else {
    statusMessage.value = successMessage.value
  }

  isSubmitting.value = false
}

onBeforeUnmount(() => {
  resetStripe()
})
</script>

<template>
  <DialogBase
    v-if="isVisible"
    :title="dialogTitle"
    :description="dialogDescription"
    @close="closeDialog"
  >
    <div class="space-y-4">
      <LoadingOverlay :visible="isLoading" :message="loadingMessage" />
      <div v-if="errorMessage" class="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
        {{ errorMessage }}
      </div>
      <div v-else-if="statusMessage" class="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
        {{ statusMessage }}
      </div>
      <form v-if="!isLoading && !isMockResponse" class="space-y-4" @submit.prevent="submitPayment">
        <div ref="paymentElementContainer" class="rounded-xl border border-slate-200 p-4"></div>
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100"
            @click="closeDialog"
          >
            {{ i18nStore.t('dialogs.close') }}
          </button>
          <button
            type="submit"
            class="rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-primary/90 disabled:opacity-60"
            :disabled="isSubmitting"
          >
            <span v-if="isSubmitting" class="flex items-center gap-2">
              <span class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
              {{ submitLabel }}
            </span>
            <span v-else>{{ submitLabel }}</span>
          </button>
        </div>
      </form>
      <div v-else-if="isMockResponse" class="flex flex-col gap-3">
        <p class="text-sm text-slate-600">{{ statusMessage ?? mockNotice }}</p>
        <button
          type="button"
          class="self-end rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100"
          @click="closeDialog"
        >
          {{ i18nStore.t('dialogs.close') }}
        </button>
      </div>
    </div>
  </DialogBase>
</template>

<style scoped>
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 0.8s linear infinite;
}
</style>
