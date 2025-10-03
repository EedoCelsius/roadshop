import { createRouter, createWebHistory } from 'vue-router'

import Experience from '@/payments/components/Experience.vue'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Experience,
    },
    {
      path: '/:methodId',
      name: 'method',
      component: Experience,
    },
  ],
  scrollBehavior: () => ({ top: 0 }),
})
