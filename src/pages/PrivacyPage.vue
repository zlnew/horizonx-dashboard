<script setup lang="ts">
import { ChevronLeft, Shield } from 'lucide-vue-next'
import AppFooter from '@/components/AppFooter.vue'
import AppLogo from '@/components/AppLogo.vue'
import { Button } from '@/components/ui/button'
import { usePageMeta } from '@/composables/page-meta'

usePageMeta({
  title: 'Privacy Policy'
})
</script>

<template>
  <div class="bg-background selection:bg-primary/20 flex min-h-screen flex-col items-center">
    <!-- Background Decor -->
    <div class="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div class="bg-primary/5 absolute top-0 left-1/4 size-[50%] rounded-full blur-[120px]"></div>
    </div>

    <!-- Navigation -->
    <header
      class="animate-in fade-in flex w-full max-w-4xl items-center justify-between px-6 py-8 duration-700"
    >
      <AppLogo />
      <Button
        variant="ghost"
        size="sm"
        as-child
      >
        <router-link :to="{ name: 'home' }">
          <ChevronLeft class="mr-2" />
          Back to Home
        </router-link>
      </Button>
    </header>

    <!-- Content -->
    <main
      class="animate-in fade-in slide-in-from-bottom-4 w-full max-w-4xl flex-1 px-6 py-16 duration-1000"
    >
      <div class="mb-12 flex items-center gap-4">
        <div class="bg-primary/10 flex size-12 items-center justify-center rounded-xl">
          <Shield class="text-primary size-6" />
        </div>
        <div>
          <h1 class="text-4xl font-black tracking-tight uppercase">Privacy Policy</h1>
          <p class="text-muted-foreground text-sm font-medium tracking-widest uppercase">
            Effective Date: April 11, 2026
          </p>
        </div>
      </div>

      <div class="prose prose-invert text-muted-foreground max-w-none space-y-12 leading-relaxed">
        <section>
          <h2 class="text-foreground mb-4 text-2xl font-bold">1. Overview</h2>
          <p>
            HorizonX ("we," "our," or "us") is dedicated to protecting your privacy. This Privacy
            Policy explains how we collect, use, and safeguard your data when you use the HorizonX
            Control Plane and Agents. Our platform is designed for engineers who prioritize security
            and transparency.
          </p>
        </section>

        <section>
          <h2 class="text-foreground mb-4 text-2xl font-bold">2. Data We Collect</h2>
          <div class="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2">
            <div class="border-border bg-card/50 rounded-xl border p-6">
              <h3 class="text-foreground mb-2 font-bold">Account Information</h3>
              <p class="text-sm">
                We collect your email address and encrypted password to manage your access to the
                Control Plane. This data is stored securely in our Go-powered backend.
              </p>
            </div>
            <div class="border-border bg-card/50 rounded-xl border p-6">
              <h3 class="text-foreground mb-2 font-bold">Infrastructure Telemetry</h3>
              <p class="text-sm">
                HorizonX Agents collect server metrics (CPU, RAM, Disk, GPU) to provide real-time
                monitoring. This data is transmitted via secure WebSockets.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-foreground mb-4 text-2xl font-bold">3. How We Use Your Data</h2>
          <ul class="list-disc space-y-4 pl-6">
            <li>
              <strong>Core Functionality:</strong> To provide real-time infrastructure monitoring
              and application deployment services.
            </li>
            <li>
              <strong>Security:</strong> To verify API tokens for Agent-Server communication and
              maintain session persistence.
            </li>
            <li>
              <strong>Platform Improvement:</strong> We analyze anonymized usage patterns to
              optimize our Go server performance and WebSocket handling.
            </li>
          </ul>
        </section>

        <section>
          <h2 class="text-foreground mb-4 text-2xl font-bold">4. Data Security</h2>
          <p>We implement industry-standard security measures to protect your data:</p>
          <ul class="mt-4 list-disc space-y-4 pl-6">
            <li>
              <strong>Encryption:</strong> All data in transit is encrypted via TLS. Passwords are
              hashed using bcrypt.
            </li>
            <li>
              <strong>Token-Based Auth:</strong> Agents connect using unique, immutable server
              tokens.
            </li>
            <li>
              <strong>Self-Hosting:</strong> As an open-source platform, you have full control over
              where your data resides.
            </li>
          </ul>
        </section>

        <section>
          <h2 class="text-foreground mb-4 text-2xl font-bold">5. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy or how HorizonX handles your
            infrastructure data, please reach out to us:
          </p>
          <div
            class="border-border bg-primary/5 text-foreground mt-6 rounded-xl border p-6 font-medium italic"
          >
            Email: aprizqymaulana@gmail.com
          </div>
        </section>
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<style scoped>
.font-black {
  font-weight: 900;
}
</style>
