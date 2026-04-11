<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { MonitorIcon, RocketIcon, ShieldCheckIcon, UsersIcon } from 'lucide-vue-next'
import AppLogo from '@/components/AppLogo.vue'
import { Button } from '@/components/ui/button'
import { usePageMeta } from '@/composables/page-meta'
import useAuthStore from '@/stores/auth'

usePageMeta({
  title: 'Infrastructure Monitoring & Deployment'
})

const authStore = useAuthStore()
const { isAuthenticated } = storeToRefs(authStore)

const year = new Date().getFullYear()
</script>

<template>
  <div
    class="bg-background selection:bg-primary/20 flex min-h-screen flex-col items-center overflow-x-hidden"
  >
    <!-- Background Decor -->
    <div class="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        class="bg-primary/5 absolute -top-[10%] -left-[10%] size-[40%] rounded-full blur-[120px]"
      ></div>
      <div
        class="bg-accent/5 absolute top-[20%] -right-[5%] size-[30%] rounded-full blur-[100px]"
      ></div>
    </div>

    <!-- Navigation -->
    <header
      class="animate-in fade-in slide-in-from-top-4 flex w-full max-w-7xl items-center justify-between px-6 py-8 duration-1000"
    >
      <AppLogo />
      <div class="flex items-center gap-2 sm:gap-4">
        <Button
          variant="ghost"
          size="sm"
          class="hidden sm:flex"
          as-child
        >
          <a
            href="https://github.com/zlnew/horizonx"
            target="_blank"
          >
            <img
              height="16"
              width="16"
              src="https://cdn.simpleicons.org/github/fff"
              class="mr-2"
            />
            GitHub
          </a>
        </Button>
        <Button
          size="sm"
          as-child
        >
          <RouterLink
            v-if="isAuthenticated"
            :to="{ name: 'dashboard' }"
          >
            Dashboard
          </RouterLink>
          <RouterLink
            v-else
            :to="{ name: 'auth.login' }"
          >
            Login
          </RouterLink>
        </Button>
      </div>
    </header>

    <!-- Hero Section -->
    <main
      class="flex w-full max-w-7xl flex-1 flex-col items-center justify-center px-6 pt-16 pb-32 text-center"
    >
      <div class="animate-in fade-in zoom-in-95 duration-1000">
        <div class="group relative mb-8 inline-flex">
          <div
            class="from-primary/50 to-accent/50 absolute -inset-1 rounded-full bg-linear-to-r opacity-20 blur transition duration-1000 group-hover:opacity-40"
          ></div>
          <div
            class="bg-background/50 border-border/50 relative rounded-full border px-4 py-1.5 text-xs font-medium backdrop-blur-md sm:text-sm"
          >
            <span class="mr-2">🚀</span>
            <span class="text-muted-foreground italic"
              >Redefining infrastructure orchestration</span
            >
          </div>
        </div>
      </div>

      <h1
        class="animate-in fade-in slide-in-from-bottom-12 mb-8 text-5xl font-black tracking-tight duration-1000 md:text-8xl"
      >
        Horizon<span class="text-primary italic">X</span>
      </h1>

      <p
        class="text-muted-foreground animate-in fade-in slide-in-from-bottom-12 mb-12 max-w-[750px] text-lg leading-relaxed duration-1000 md:text-xl"
      >
        The ultimate dashboard for modern infrastructure. Combine real-time telemetry, application
        lifecycle management, and team collaboration in one unified, high-performance experience.
      </p>

      <div
        class="animate-in fade-in slide-in-from-bottom-12 flex flex-col gap-4 duration-1000 sm:flex-row"
      >
        <Button
          size="lg"
          class="shadow-primary/20 h-14 rounded-full px-10 text-lg font-bold shadow-lg"
          as-child
        >
          <RouterLink :to="{ name: isAuthenticated ? 'dashboard' : 'auth.login' }">
            Start Operating
          </RouterLink>
        </Button>
        <Button
          size="lg"
          variant="outline"
          class="border-border/50 h-14 rounded-full px-10 text-lg font-bold backdrop-blur-sm"
          as-child
        >
          <a
            href="https://github.com/zlnew/horizonx"
            target="_blank"
          >
            <img
              height="16"
              width="16"
              src="https://cdn.simpleicons.org/github/fff"
              class="mr-2"
            />
            Repository
          </a>
        </Button>
      </div>

      <!-- Feature Grid -->
      <div
        class="animate-in fade-in slide-in-from-bottom-12 mt-36 grid w-full grid-cols-1 gap-4 duration-1000 md:grid-cols-2 md:gap-8 lg:grid-cols-4"
      >
        <!-- Feature 1: Monitoring -->
        <div class="group relative">
          <div
            class="from-primary/10 absolute -inset-2 rounded-2xl bg-linear-to-b to-transparent opacity-0 transition duration-500 group-hover:opacity-100"
          ></div>
          <div
            class="border-border/50 bg-card/40 hover:border-primary/30 relative flex h-full flex-col items-center rounded-2xl border p-8 text-center backdrop-blur-xl transition-all duration-300 sm:items-start sm:text-left"
          >
            <div
              class="bg-primary/10 group-hover:bg-primary/20 mb-6 flex size-14 items-center justify-center rounded-2xl transition-all duration-500 group-hover:scale-110"
            >
              <MonitorIcon class="text-primary size-7" />
            </div>
            <h3 class="mb-3 text-xl font-bold tracking-tight">Real-Time Telemetry</h3>
            <p class="text-muted-foreground text-sm leading-relaxed">
              Second-by-second hardware stats via Go-powered agents. Monitor CPU, RAM, and native
              Nvidia GPU metrics for AI/ML workloads.
            </p>
          </div>
        </div>

        <!-- Feature 2: GitOps -->
        <div class="group relative">
          <div
            class="from-primary/10 absolute -inset-2 rounded-2xl bg-linear-to-b to-transparent opacity-0 transition duration-500 group-hover:opacity-100"
          ></div>
          <div
            class="border-border/50 bg-card/40 hover:border-primary/30 relative flex h-full flex-col items-center rounded-2xl border p-8 text-center backdrop-blur-xl transition-all duration-300 sm:items-start sm:text-left"
          >
            <div
              class="bg-primary/10 group-hover:bg-primary/20 mb-6 flex size-14 items-center justify-center rounded-2xl transition-all duration-500 group-hover:scale-110"
            >
              <RocketIcon class="text-primary size-7" />
            </div>
            <h3 class="mb-3 text-xl font-bold tracking-tight">GitOps Deployments</h3>
            <p class="text-muted-foreground text-sm leading-relaxed">
              Deploy from any Git repo with Docker Compose. Zero-downtime application lifecycle
              management directly through your unified dashboard.
            </p>
          </div>
        </div>

        <!-- Feature 3: Architecture -->
        <div class="group relative">
          <div
            class="from-primary/10 absolute -inset-2 rounded-2xl bg-linear-to-b to-transparent opacity-0 transition duration-500 group-hover:opacity-100"
          ></div>
          <div
            class="border-border/50 bg-card/40 hover:border-primary/30 relative flex h-full flex-col items-center rounded-2xl border p-8 text-center backdrop-blur-xl transition-all duration-300 sm:items-start sm:text-left"
          >
            <div
              class="bg-primary/10 group-hover:bg-primary/20 mb-6 flex size-14 items-center justify-center rounded-2xl transition-all duration-500 group-hover:scale-110"
            >
              <UsersIcon class="text-primary size-7" />
            </div>
            <h3 class="mb-3 text-xl font-bold tracking-tight">Control Plane</h3>
            <p class="text-muted-foreground text-sm leading-relaxed">
              Centralized API for fleet management. Secure Agent-Server communication via persistent
              WebSockets and token-based authentication.
            </p>
          </div>
        </div>

        <!-- Feature 4: Security -->
        <div class="group relative">
          <div
            class="from-primary/10 absolute -inset-2 rounded-2xl bg-linear-to-b to-transparent opacity-0 transition duration-500 group-hover:opacity-100"
          ></div>
          <div
            class="border-border/50 bg-card/40 hover:border-primary/30 relative flex h-full flex-col items-center rounded-2xl border p-8 text-center backdrop-blur-xl transition-all duration-300 sm:items-start sm:text-left"
          >
            <div
              class="bg-primary/10 group-hover:bg-primary/20 mb-6 flex size-14 items-center justify-center rounded-2xl transition-all duration-500 group-hover:scale-110"
            >
              <ShieldCheckIcon class="text-primary size-7" />
            </div>
            <h3 class="mb-3 text-xl font-bold tracking-tight">Clean Architecture</h3>
            <p class="text-muted-foreground text-sm leading-relaxed">
              Built with resilience in mind. High-performance Go backend with PostgreSQL and Redis
              for sub-millisecond data persistence.
            </p>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="border-border/50 bg-card/20 w-full border-t py-16 backdrop-blur-md">
      <div
        class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-10 px-6 md:flex-row"
      >
        <div class="flex flex-col items-center gap-4 md:items-start">
          <AppLogo />
          <p class="text-muted-foreground max-w-[300px] text-center text-sm md:text-left">
            Empowering engineers to orchestrate the world's infrastructure with precision and
            elegance.
          </p>
        </div>

        <div class="flex flex-col items-center gap-6 text-center md:items-end md:text-right">
          <div
            class="flex items-center gap-8 opacity-40 grayscale transition-all duration-500 hover:opacity-100 hover:grayscale-0"
          >
            <img
              height="32"
              width="32"
              src="https://cdn.simpleicons.org/go/00ADD8"
            />
            <img
              height="24"
              width="24"
              src="https://cdn.simpleicons.org/docker/2496ED"
            />
            <img
              height="20"
              width="20"
              src="https://cdn.simpleicons.org/vue.js/4FC08D"
            />
            <img
              height="28"
              width="28"
              src="https://cdn.simpleicons.org/tailwindcss/06B6D4"
            />
          </div>
          <div
            class="text-muted-foreground/40 mb-2 flex items-center gap-4 text-[10px] font-bold tracking-widest uppercase"
          >
            <RouterLink
              :to="{ name: 'privacy' }"
              class="hover:text-primary transition-colors"
            >
              Privacy Policy
            </RouterLink>
            <span class="bg-border size-1 rounded-full"></span>
            <a
              href="https://github.com/zlnew/horizonx"
              target="_blank"
              class="hover:text-primary transition-colors"
              >GitHub Repository</a
            >
          </div>
          <p class="text-muted-foreground/60 text-xs font-medium tracking-tighter">
            © {{ year }} HORIZONX PLATFORM. OPEN SOURCE UNDER MIT LICENSE.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.font-black {
  font-weight: 900;
}
</style>
