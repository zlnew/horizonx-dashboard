import { type AsyncComponentLoader, type Component, markRaw, ref } from 'vue'

type DialogItem = {
  id: string
  component: Component
}

const dialogs = ref<DialogItem[]>([])

const isAsyncComponent = (
  component: Component
): component is { __asyncLoader: AsyncComponentLoader } => {
  return '__asyncLoader' in component
}

const open = async (component: Component) => {
  let resolvedComponent = component

  if (isAsyncComponent(component)) {
    resolvedComponent = await component.__asyncLoader()
  }

  dialogs.value.push({
    id: crypto.randomUUID(),
    component: markRaw(resolvedComponent)
  })
}

const close = () => {
  dialogs.value.pop()
}

const closeByID = (id: string) => {
  setTimeout(() => {
    dialogs.value = dialogs.value.filter((d) => d.id !== id)
  }, 300)
}

export const dialog = {
  open,
  close,
  closeByID
}

export function useDialog() {
  const openDialog = async (component: Component) => await open(component)
  const closeDialog = () => close()
  const closeDialogByID = (id: string) => closeByID(id)

  return {
    dialogs,
    openDialog,
    closeDialog,
    closeDialogByID
  }
}
