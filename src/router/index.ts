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
      redirect: { name: 'applications' },
      component: MainLayout,
      children: [
        {
          path: 'applications',
          children: [
            {
              name: 'applications',
              path: '',
              component: () => import('@/pages/ApplicationsPage.vue')
            },
            {
              name: 'applications.create',
              path: 'create',
              component: () => import('@/pages/ApplicationCreatePage.vue')
            },
            {
              path: ':id',
              component: () => import('@/layouts/ApplicationDetailsLayout.vue'),
              children: [
                {
                  name: 'applications.overview',
                  path: 'overview',
                  component: () => import('@/pages/ApplicationOverviewPage.vue')
                },
                {
                  name: 'applications.configuration',
                  path: 'configuration',
                  component: () => import('@/pages/ApplicationConfigurationPage.vue')
                },
                {
                  name: 'applications.deploys',
                  path: 'deploys',
                  component: () => import('@/pages/ApplicationDeploysPage.vue')
                },
                {
                  name: 'applications.deploys.show',
                  path: 'deploys/:deploymentID',
                  component: () => import('@/pages/ApplicationDeployDetailsPage.vue')
                },
                {
                  name: 'applications.logs',
                  path: 'logs',
                  component: () => import('@/pages/ApplicationLogsPage.vue')
                },
                {
                  name: 'applications.logs.show',
                  path: 'logs/:jobID',
                  component: () => import('@/pages/ApplicationLogDetailsPage.vue')
                }
              ]
            }
          ]
        },
        {
          name: 'servers',
          path: 'servers',
          component: () => import('@/pages/ServersPage.vue')
        },
        {
          name: 'server.metrics',
          path: 'server-metrics',
          component: () => import('@/pages/ServerMetricsPage.vue')
        },
        {
          name: 'members',
          path: 'members',
          component: () => import('@/pages/MembersPage.vue')
        }
      ]
    }
  ]
})

export default router
