import { createRouter, createWebHistory } from 'vue-router'

import Experience from '@/payments/components/Experience.vue'

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
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
  })
