<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import {
  PlusIcon,
  RefreshCwIcon,
  SearchIcon,
  SquarePenIcon,
  TableOfContentsIcon,
  TrashIcon,
  UsersIcon
} from 'lucide-vue-next'
import type { AcceptableValue } from 'reka-ui'
import { toast } from 'vue-sonner'
import DataLoading from '@/components/DataLoading.vue'
import DataNotFound from '@/components/DataNotFound.vue'
import RoutePagination from '@/components/RoutePagination.vue'
import UserCreateDialog from '@/components/dialogs/UserCreateDialog.vue'
import UserDeleteDialog from '@/components/dialogs/UserDeleteDialog.vue'
import UserUpdateDialog from '@/components/dialogs/UserUpdateDialog.vue'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import useAppStore from '@/stores/app'
import useUserStore from '@/stores/user'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()
const { title } = storeToRefs(appStore)
const { users, meta, loading, refetch, notFound, perPage, search } = storeToRefs(userStore)

const criteria = computed(() => route.query as Criteria)

watch(refetch, (refetched) => {
  if (refetched) {
    fetchUsers(criteria.value)
  }
})

onMounted(() => {
  title.value = 'Users'
  search.value = criteria.value.search ?? ''
  perPage.value = criteria.value.limit ?? 20

  fetchUsers(criteria.value)
})

onBeforeRouteUpdate((to) => {
  const criteria = to.query as Criteria

  search.value = criteria.search ?? ''
  perPage.value = criteria.limit ?? 20

  fetchUsers(criteria)
})

const fetchUsers = async (criteria: Criteria) => {
  try {
    await userStore.getUsers({
      ...criteria,
      paginate: true,
      limit: criteria.limit ?? 20
    })
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

const handlePerPage = (perPage: AcceptableValue) => {
  router.push({
    query: {
      ...route.query,
      limit: perPage?.toString()
    }
  })
}

const handleRefresh = () => {
  refetch.value = true
}

const showCreateModal = () => {
  userStore.dialogCreateOpen = true
}

const showUpdateModal = (user: User) => {
  userStore.selectedUser = user
  userStore.dialogUpdateOpen = true
}

const showDeleteModal = (user: User) => {
  userStore.selectedUser = user
  userStore.dialogDeleteOpen = true
}
</script>

<template>
  <section>
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink>Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Users</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  </section>

  <section class="mt-8">
    <div class="flex flex-wrap items-center justify-between gap-8">
      <div class="flex items-center gap-4">
        <div class="bg-accent rounded-lg p-3">
          <UsersIcon :size="24" />
        </div>
        <div class="flex flex-col gap-0">
          <div class="text-xl">Users</div>
          <div class="text-sm text-neutral-400">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dolore, suscipit?
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <Button
          type="button"
          @click="showCreateModal"
        >
          <PlusIcon />
          Create User
        </Button>
      </div>
    </div>
  </section>

  <section class="mt-8 space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div class="flex-1">
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
      <div class="flex items-center justify-end gap-2">
        <Select
          v-model="perPage"
          @update:modelValue="handlePerPage"
        >
          <SelectTrigger>
            <div class="text-neutral-400">
              <TableOfContentsIcon />
            </div>
            <SelectValue placeholder="Per Page" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="60">60</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="outline"
          @click="handleRefresh"
        >
          <div class="text-neutral-400">
            <RefreshCwIcon />
          </div>
          Refresh
        </Button>
      </div>
    </div>

    <template v-if="users.length">
      <div class="bg-card text-card-foreground rounded-lg p-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead class="w-8">#</TableHead>
              <TableHead>Email</TableHead>
              <TableHead class="text-end">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="(row, index) in users"
              :key="index"
            >
              <TableCell>
                {{ meta ? (meta?.current_page - 1) * meta.per_page + index + 1 : 0 }}.
              </TableCell>
              <TableCell>{{ row.email }}</TableCell>
              <TableCell>
                <div class="flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="outline"
                    aria-label="Edit user"
                    @click="showUpdateModal(row)"
                  >
                    <SquarePenIcon />
                  </Button>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="destructive"
                    aria-label="Delete user"
                    @click="showDeleteModal(row)"
                  >
                    <TrashIcon />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <RoutePagination
        v-if="meta"
        :meta="meta"
      />
    </template>

    <DataLoading v-else-if="loading" />
    <DataNotFound v-else-if="notFound" />
  </section>

  <Teleport to="body">
    <UserCreateDialog />
    <UserUpdateDialog />
    <UserDeleteDialog />
  </Teleport>
</template>
