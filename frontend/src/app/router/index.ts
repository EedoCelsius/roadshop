import { createRouter, createWebHistory } from 'vue-router'

import Experience from '@/payments/components/Experience.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Experience,
    },
    {
      path: '/:method(kakao|toss|transfer)',
      name: 'method',
      component: Experience,
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

export default router
