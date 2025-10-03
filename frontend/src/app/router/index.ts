import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

import Experience from '@/payments/components/Experience.vue'

const routes: RouteRecordRaw[] = [
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
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: 'home' },
  },
]

export const createAppRouter = () =>
  createRouter({
    history: createWebHistory('/roadshop/'),
    routes,
  })
