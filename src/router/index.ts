import { createRouter, createWebHistory } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import MainLayout from '@/layouts/MainLayout.vue'
import useLoadingStore from '@/stores/loading'

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
      name: 'servers.select',
      path: '/servers/select',
      component: () => import('@/pages/ServerSelectPage.vue')
    },
    {
      path: '/',
      redirect: { name: 'system-monitor' },
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
                  name: 'applications.activities',
                  path: 'activities',
                  component: () => import('@/pages/ApplicationActivitiesPage.vue')
                },
                {
                  name: 'applications.activities.show',
                  path: 'activities/:jobID',
                  component: () => import('@/pages/ApplicationActivityDetailsPage.vue')
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
          name: 'system-monitor',
          path: 'system-monitor',
          component: () => import('@/pages/SystemMonitorPage.vue')
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

router.beforeEach(() => {
  useLoadingStore().start()
})

router.afterEach(() => {
  useLoadingStore().done()
})

export default router
