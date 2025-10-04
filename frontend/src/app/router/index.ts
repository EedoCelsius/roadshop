import { createRouter, createWebHistory } from 'vue-router'

import Experience from '@/payments/components/Experience.vue'

const normalizeBaseUrl = (baseUrl?: string) => {
  if (!baseUrl || baseUrl === './') {
    return '/'
  }

  const referenceOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost'

  try {
    const parsed = new URL(baseUrl, referenceOrigin)
    baseUrl = parsed.pathname
  } catch {
    // If the value cannot be parsed as a full URL we keep it as-is.
  }

  const trimmed = baseUrl.replace(/^\/+|\/+$/g, '')

  if (!trimmed) {
    return '/'
  }

  return `/${trimmed}/`
}

const routes = [
  {
    path: '/',
    name: 'home',
    component: Experience,
  },
  {
    path: '/:method',
    name: 'payment-method',
    component: Experience,
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

export const createAppRouter = () =>
  createRouter({
    history: createWebHistory(normalizeBaseUrl(import.meta.env.BASE_URL)),
    routes,
  })
