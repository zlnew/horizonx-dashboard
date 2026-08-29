<script setup lang="ts">
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import useAlertRuleStore from '@/stores/alert-rule'

const props = defineProps<{
  open?: boolean
  rule: AlertRule | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  success: []
}>()

const ruleStore = useAlertRuleStore()

const deleting = ref(false)
const deleteError = ref<string | null>(null)

const close = () => {
  emit('update:open', false)
}

const onDelete = async () => {
  if (!props.rule) {
    return
  }

  deleting.value = true
  deleteError.value = null

  try {
    const res = await ruleStore.deleteRule(props.rule.id)
    toast.success(res.message ?? 'Alert rule deleted successfully')
    emit('success')
    close()
  } catch (error) {
    const fetchError = error as Error
    deleteError.value = fetchError.message
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <Dialog
    :open="props.open"
    @update:open="(v) => emit('update:open', v)"
  >
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Delete Alert Rule</DialogTitle>
        <DialogDescription>
          This will permanently remove
          <span class="text-foreground font-semibold">{{ props.rule?.name }}</span>
          and stop future alerts from it. Firing alerts already recorded are kept in history. This
          action cannot be undone.
        </DialogDescription>
      </DialogHeader>

      <div
        v-if="deleteError"
        class="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-3 py-2 text-sm"
      >
        {{ deleteError }}
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          :disabled="deleting"
          @click="close"
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="destructive"
          :disabled="deleting"
          @click="onDelete"
        >
          {{ deleting ? 'Deleting…' : 'Delete Rule' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
