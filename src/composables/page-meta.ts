import { type MaybeRef, unref, watchEffect } from 'vue'
import { storeToRefs } from 'pinia'
import useAppStore from '@/stores/app'

type PageMetaOptions = {
  title?: MaybeRef<string | null>
  breadcrumb?: MaybeRef<Breadcrumb[]>
}

export const defineBreadcrumbs = (value: Breadcrumb[]) => {
  return value
}

export function usePageMeta(options: PageMetaOptions) {
  const appStore = useAppStore()
  const { title, breadcrumb } = storeToRefs(appStore)

  watchEffect((onCleanup) => {
    if (options.title !== undefined) {
      title.value = unref(options.title)
    }

    if (options.breadcrumb !== undefined) {
      breadcrumb.value = unref(options.breadcrumb) ?? []
    }

    onCleanup(() => {
      if (options.title !== undefined) {
        title.value = null
      }

      if (options.breadcrumb !== undefined) {
        breadcrumb.value = []
      }
    })
  })
}
