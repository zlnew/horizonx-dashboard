<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, onUnmounted, watch } from 'vue'
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { PlusIcon, SearchIcon, SquarePenIcon, TrashIcon, UsersIcon } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import DataLoading from '@/components/DataLoading.vue'
import DataNotFound from '@/components/DataNotFound.vue'
import RoleBadge from '@/components/RoleBadge.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { dialog } from '@/composables/dialog'
import { usePageMeta } from '@/composables/page-meta'
import useUserStore from '@/stores/user'

type Criteria = UserCriteria

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const { users, loading, refetch, notFound, search, canReadMember, canWriteMember } =
  storeToRefs(userStore)

const criteria = computed(() => route.query as Criteria)

watch(refetch, (refetched) => {
  if (refetched) {
    fetchUsers(criteria.value)
  }
})

usePageMeta({
  title: 'Members',
  breadcrumb: [
    {
      label: 'Members',
      to: { name: 'members' }
    }
  ]
})

onMounted(() => {
  search.value = criteria.value.search ?? ''

  fetchUsers(criteria.value)
})

onBeforeRouteUpdate((to) => {
  const criteria = to.query as Criteria

  search.value = criteria.search ?? ''

  fetchUsers(criteria)
})

onUnmounted(() => {
  userStore.cleanupState()
})

const fetchUsers = async (criteria: Criteria) => {
  if (!canReadMember.value) {
    return
  }

  try {
    await userStore.getUsers(criteria)
  } catch (error) {
    const fetchError = error as Error
    toast.error(fetchError.message)
  }
}

const handleSearch = () => {
  router.push({
    query: {
      ...route.query,
      page: 1,
      search: search.value
    }
  })
}

const showCreateModal = () => {
  dialog.open(defineAsyncComponent(() => import('@/components/dialogs/UserCreateDialog.vue')))
}

const showUpdateModal = (user: User) => {
  userStore.selectedUser = user
  dialog.open(defineAsyncComponent(() => import('@/components/dialogs/UserUpdateDialog.vue')))
}

const showDeleteModal = (user: User) => {
  userStore.selectedUser = user
  dialog.open(defineAsyncComponent(() => import('@/components/dialogs/UserDeleteDialog.vue')))
}
</script>

<template>
  <section>
    <div class="flex flex-wrap items-center justify-between gap-8">
      <div class="flex items-center gap-4">
        <div class="bg-accent/50 border-border/50 rounded-xl border p-3">
          <UsersIcon
            :size="24"
            class="text-primary"
          />
        </div>
        <div class="border-border/50 flex flex-col gap-0 border-l pl-4">
          <h1 class="text-2xl font-black tracking-tight uppercase">Members</h1>
          <p class="text-muted-foreground text-sm font-medium italic">
            Everything about your team, organized and easy to manage.
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <Button
          v-if="canWriteMember"
          type="button"
          class="shadow-primary/10 rounded-full shadow-lg transition-transform active:scale-95"
          @click="showCreateModal"
        >
          <PlusIcon />
          Create User
        </Button>
      </div>
    </div>
  </section>

  <section class="mt-12 space-y-4">
    <div class="flex flex-wrap-reverse items-center justify-between gap-4 sm:flex-wrap">
      <div class="flex-auto sm:flex-1">
        <InputGroup>
          <InputGroupInput
            v-model="search"
            placeholder="Search&hellip;"
            @keyup.enter="handleSearch"
          />
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
        </InputGroup>
      </div>
    </div>

    <template v-if="users.length">
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="w-8">#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead
                  v-if="canWriteMember"
                  class="text-end"
                >
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow
                v-for="(row, index) in users"
                :key="index"
              >
                <TableCell>{{ index + 1 }}.</TableCell>
                <TableCell class="font-bold">{{ row.name }}</TableCell>
                <TableCell>{{ row.email }}</TableCell>
                <TableCell>
                  <RoleBadge :role-name="row.role.name" />
                </TableCell>
                <TableCell v-if="canWriteMember">
                  <div class="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      class="border-border/50 bg-accent/30 hover:bg-primary/10 hover:text-primary hover:border-primary/30 rounded-lg border transition-all"
                      aria-label="Edit user"
                      @click="showUpdateModal(row)"
                    >
                      <SquarePenIcon :size="16" />
                    </Button>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      class="border-border/50 bg-accent/30 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 rounded-lg border transition-all"
                      aria-label="Delete user"
                      @click="showDeleteModal(row)"
                    >
                      <TrashIcon :size="16" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </template>

    <DataLoading v-else-if="loading" />
    <DataNotFound v-else-if="notFound" />
  </section>
</template>

<style scoped>
.font-black {
  font-weight: 900;
}
</style>
