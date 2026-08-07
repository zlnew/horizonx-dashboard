<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import {
  BookOpenIcon,
  KeyRoundIcon,
  RocketIcon,
  WebhookIcon
} from 'lucide-vue-next'
import { Card, CardContent } from '@/components/ui/card'
import { usePageMeta } from '@/composables/page-meta'

usePageMeta({
  title: 'Help',
  breadcrumb: [
    {
      label: 'Help',
      to: { name: 'settings.help' }
    }
  ]
})

const route = useRoute()

const sections = [
  { id: 'getting-started', label: 'Getting Started', icon: RocketIcon },
  { id: 'webhooks', label: 'Webhooks', icon: WebhookIcon },
  { id: 'security', label: 'Security', icon: KeyRoundIcon }
]

const active = ref('getting-started')

onMounted(() => {
  const hash = route.hash?.replace('#', '')
  if (hash && sections.some((s) => s.id === hash)) {
    active.value = hash
  }
})

const scrollTo = (id: string) => {
  active.value = id
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <section>
    <div class="flex flex-wrap items-center justify-between gap-8">
      <div class="flex items-center gap-4">
        <div class="bg-accent/50 border-border/50 rounded-xl border p-3">
          <BookOpenIcon
            :size="24"
            class="text-primary"
          />
        </div>
        <div class="border-border/50 flex flex-col gap-0 border-l pl-4">
          <h1 class="text-2xl font-black tracking-tight uppercase">Help</h1>
          <p class="text-muted-foreground text-sm font-medium italic">
            Getting started, webhooks, and security for the control plane
          </p>
        </div>
      </div>
    </div>
  </section>

  <section class="mt-12 grid gap-8 lg:grid-cols-[220px_1fr]">
    <!-- Section nav -->
    <nav class="border-border/50 space-y-1 self-start rounded-xl border p-2 lg:sticky lg:top-24">
      <button
        v-for="s in sections"
        :key="s.id"
        type="button"
        class="hover:bg-accent/60 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition-colors"
        :class="active === s.id ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'"
        @click="scrollTo(s.id)"
      >
        <component
          :is="s.icon"
          :size="16"
        />
        {{ s.label }}
      </button>
    </nav>

    <div class="min-w-0 space-y-8">
      <!-- Getting Started -->
      <Card id="getting-started">
        <CardContent class="space-y-6 p-6">
          <div class="flex items-center gap-3">
            <RocketIcon
              :size="18"
              class="text-primary"
            />
            <h2 class="text-lg font-black tracking-tight uppercase">Getting Started</h2>
          </div>

          <div class="space-y-4 text-sm leading-relaxed">
            <div>
              <h3 class="mb-1 font-bold">1. Install an agent on a host</h3>
              <p class="text-muted-foreground">
                On each machine you want to monitor or deploy to, run
                <code class="bg-accent/60 text-accent-foreground rounded px-1.5 py-0.5 font-mono text-xs">
                  curl -fsSL https://raw.githubusercontent.com/zlnew/horizonx/main/install.sh | sudo bash
                </code>
                and choose <span class="font-semibold">agent</span>.
              </p>
            </div>

            <div>
              <h3 class="mb-1 font-bold">2. Register the server</h3>
              <p class="text-muted-foreground">
                In the dashboard, open <span class="font-semibold">Servers → Add Server</span>. The
                control plane shows the agent token <span class="font-semibold">once</span> — copy
                it and paste it when the agent installer asks for the server address and token.
              </p>
            </div>

            <div>
              <h3 class="mb-1 font-bold">3. Deploy your first app</h3>
              <p class="text-muted-foreground">
                Use <span class="font-semibold">Applications → Create</span>. Point the app at a git
                repo, pick the registered server, and HorizonX builds and runs it via Docker Compose
                on the agent host. Deployments, logs, and health checks are visible on the
                application pages.
              </p>
            </div>

            <div>
              <h3 class="mb-1 font-bold">4. Watch the queue</h3>
              <p class="text-muted-foreground">
                Every deploy, start, stop, rollback, and health check runs as a job in the control
                plane. The <span class="font-semibold">Jobs</span> page shows the full queue; failed
                or expired jobs can be re-queued with the Retry action.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Webhooks -->
      <Card id="webhooks">
        <CardContent class="space-y-6 p-6">
          <div class="flex items-center gap-3">
            <WebhookIcon
              :size="18"
              class="text-primary"
            />
            <h2 class="text-lg font-black tracking-tight uppercase">Webhooks</h2>
          </div>

          <div class="space-y-4 text-sm leading-relaxed">
            <p class="text-muted-foreground">
              HorizonX can notify your own services when events happen (deployments, job status
              changes). Configure the endpoint under <span class="font-semibold">Webhooks</span> in
              the sidebar, then use <span class="font-semibold">Test Ping</span> to verify delivery.
            </p>

            <div>
              <h3 class="mb-1 font-bold">Payload</h3>
              <p class="text-muted-foreground">
                Each notification is a POST with a JSON body containing the event name and payload,
                e.g. <code class="bg-accent/60 text-accent-foreground rounded px-1.5 py-0.5 font-mono text-xs">job_status_changed</code>.
              </p>
            </div>

            <div>
              <h3 class="mb-1 font-bold">Signing secret</h3>
              <p class="text-muted-foreground">
                Set a secret to sign requests. HorizonX sends an
                <code class="bg-accent/60 text-accent-foreground rounded px-1.5 py-0.5 font-mono text-xs">X-HorizonX-Signature</code>
                header — an HMAC-SHA256 of the raw body keyed with your secret. Verify it on your
                receiver to prove the request came from this control plane. The secret is never
                returned by the API; leave the field empty to keep the current one, or use
                <span class="font-semibold">Clear Secret</span> to remove it.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Security -->
      <Card id="security">
        <CardContent class="space-y-6 p-6">
          <div class="flex items-center gap-3">
            <KeyRoundIcon
              :size="18"
              class="text-primary"
            />
            <h2 class="text-lg font-black tracking-tight uppercase">Security</h2>
          </div>

          <div class="space-y-4 text-sm leading-relaxed">
            <div>
              <h3 class="mb-1 font-bold">Agent tokens</h3>
              <p class="text-muted-foreground">
                Each server has a token that agents present to authenticate. If a token is ever
                exposed, rotate it from the server page — the old token stops working immediately
                and a new one is shown exactly once.
              </p>
            </div>

            <div>
              <h3 class="mb-1 font-bold">Sessions</h3>
              <p class="text-muted-foreground">
                User logins are tracked as revocable sessions. Logging out, changing your password,
                or an admin revoking a member's sessions invalidates those tokens immediately.
              </p>
            </div>

            <div>
              <h3 class="mb-1 font-bold">Network</h3>
              <p class="text-muted-foreground">
                The control plane binds to localhost and is intended to be reached through a
                reverse proxy or tunnel with TLS. Behind Cloudflare, client IPs are taken from
                <code class="bg-accent/60 text-accent-foreground rounded px-1.5 py-0.5 font-mono text-xs">X-Forwarded-For</code>
                so rate limits apply to the real client, not the proxy.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </section>
</template>
