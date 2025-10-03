import { createRouter, createWebHistory } from 'vue-router'

import Experience from '@/payments/components/Experience.vue'

export const createAppRouter = () =>
  createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
      {
        path: '/roadshop/:dialog?',
        name: 'roadshop',
        component: Experience,
        alias: '/',
      },
      {
        path: '/:pathMatch(.*)*',
        redirect: '/roadshop',
      },
    ],
  })
