<script setup lang="ts">
import { computed } from 'vue'

import { getFirmIcon } from '@icons/firms'
import type { TransferAccount } from '@/payments/services/paymentInfoService'

interface Props {
  account: TransferAccount
}

const props = defineProps<Props>()
</script>

<template>
  <article class="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/95 p-8 shadow-md">
    <div class="flex flex-col items-center gap-7 text-center">
      <div class="flex flex-col items-center gap-5">
        <div
          class="flex h-20 w-20 items-center justify-center rounded-3xl bg-roadshop-highlight/60 shadow-inner"
          aria-hidden="true"
        >
          <img :src="getFirmIcon(props.account.bank.value)" :alt="props.account.bank" class="h-14 w-14" />
        </div>
        <div>
          <p class="text-2xl font-semibold text-roadshop-primary">
            {{ props.account.bank }}<span class="ml-2 text-lg font-medium text-roadshop-primary/80">({{ props.account.holder }})</span>
          </p>
          <p class="mt-3 font-mono text-lg tracking-wider text-slate-700">{{ props.account.number }}</p>
        </div>
      </div>
    </div>
  </article>
</template>
