<script setup lang="ts">
import { storeToRefs } from 'pinia'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import useAppStore from '@/stores/app'

const appStore = useAppStore()
const { breadcrumb } = storeToRefs(appStore)
</script>

<template>
  <Breadcrumb>
    <BreadcrumbList>
      <template
        v-for="(br, i) in breadcrumb"
        :key="i"
      >
        <template v-if="i === breadcrumb.length - 1">
          <BreadcrumbItem>
            <BreadcrumbPage class="line-clamp-1">{{ br.label }}</BreadcrumbPage>
          </BreadcrumbItem>
        </template>

        <template v-else>
          <BreadcrumbItem class="hidden md:block">
            <BreadcrumbLink as-child>
              <template v-if="br.to">
                <RouterLink :to="br.to">
                  {{ br.label }}
                </RouterLink>
              </template>
              <template v-else>
                <a href="#">{{ br.label }}</a>
              </template>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </template>

        <BreadcrumbSeparator
          v-if="i < breadcrumb.length - 1"
          class="hidden md:block"
        />
      </template>
    </BreadcrumbList>
  </Breadcrumb>
</template>
