import type { Component } from 'vue'
import {
  ChartColumnBigIcon,
  CircleUserIcon,
  HistoryIcon,
  LayoutGridIcon,
  ServerIcon,
  UsersIcon,
  WebhookIcon
} from 'lucide-vue-next'

type To = {
  name: string
}

interface Menu {
  label: string
  value: string
  to?: To
  icon?: Component
  items?: Array<Menu & { to: To }>
}

const useApp = () => {
  const wsUrl = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.host

    return `${protocol}//${host}/api/ws/user`
  }

  const menu: Menu[] = [
    {
      label: 'Overview',
      value: 'overview',
      items: [
        {
          label: 'System Monitor',
          value: 'system monitor',
          to: { name: 'system-monitor' },
          icon: ChartColumnBigIcon
        },
        {
          label: 'Applications',
          value: 'applications',
          to: { name: 'applications' },
          icon: LayoutGridIcon
        }
      ]
    },
    {
      label: 'Settings',
      value: 'settings',
      items: [
        {
          label: 'Servers',
          value: 'servers',
          to: { name: 'servers' },
          icon: ServerIcon
        },
        {
          label: 'Audit Log',
          value: 'audit log',
          to: { name: 'audit-logs' },
          icon: HistoryIcon
        },
        {
          label: 'Members',
          value: 'members',
          to: { name: 'members' },
          icon: UsersIcon
        },
        {
          label: 'Account',
          value: 'account',
          to: { name: 'account' },
          icon: CircleUserIcon
        },
        {
          label: 'Webhooks',
          value: 'webhooks',
          to: { name: 'settings.webhooks' },
          icon: WebhookIcon
        }
      ]
    }
  ]

  return {
    appURL: import.meta.env.VITE_APP_URL,
    wsURL: wsUrl(),
    menu
  }
}

export default useApp
