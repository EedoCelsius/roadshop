import { createRouter, createWebHistory } from 'vue-router'

export const createAppRouter = () =>
  createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
      {
        path: '/:dialog(kakao|toss|transfer)?',
        name: 'experience',
        component: () => import('@/app/views/ExperienceView.vue'),
      },
    ],
    scrollBehavior: () => ({ top: 0 }),
  })
