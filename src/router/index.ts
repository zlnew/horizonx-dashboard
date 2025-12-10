import { createRouter, createWebHistory } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import MainLayout from '@/layouts/MainLayout.vue'

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
          component: () => import('@/pages/auth/LoginPage.vue')
        }
      ]
    },
    {
      path: '/',
      component: MainLayout,
      children: [
        {
          name: 'dashboard',
          path: '',
          component: () => import('@/pages/DashboardPage.vue')
        },
        {
          name: 'servers',
          path: 'servers',
          component: () => import('@/pages/ServersPage.vue')
        },
        {
          name: 'team',
          path: 'team',
          component: () => import('@/pages/TeamPage.vue')
        }
      ]
    }
  ]
})

export default router
