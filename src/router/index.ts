import AuthLayout from '@/layouts/AuthLayout.vue'
import MainLayout from '@/layouts/MainLayout.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/auth',
      component: AuthLayout,
      children: [
        {
          name: 'auth.login',
          path: 'login',
          component: () => import('@/pages/auth/LoginPage.vue'),
        },
      ],
    },
    {
      path: '/',
      component: MainLayout,
      children: [
        {
          name: 'dashboard',
          path: '',
          component: () => import('@/pages/DashboardPage.vue'),
        },
      ],
    },
  ],
})

export default router
