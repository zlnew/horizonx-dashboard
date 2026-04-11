<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { toTypedSchema } from '@vee-validate/zod'
import { CheckCircleIcon, FolderIcon, PlusIcon, SlidersIcon, XIcon } from 'lucide-vue-next'
import { useFieldArray, useForm, useFormValues } from 'vee-validate'
import { toast } from 'vue-sonner'
import z from 'zod'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger
} from '@/components/ui/stepper'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { usePageMeta } from '@/composables/page-meta'
import useAppStore from '@/stores/app'
import useApplicationStore from '@/stores/application'

const router = useRouter()
const appStore = useAppStore()
const applicationStore = useApplicationStore()

const stepIndex = ref(1)
const steps = [
  {
    step: 1,
    title: 'Project Details',
    description: 'Define basic project information',
    icon: FolderIcon
  },
  {
    step: 2,
    title: 'Environment Variables',
    description: 'Set required runtime variables',
    icon: SlidersIcon
  },
  {
    step: 3,
    title: 'Finalize',
    description: 'Review and finalize you setup',
    icon: CheckCircleIcon
  }
]

const repoNamePattern = /^[a-z0-9]+(?:[-.][a-z0-9]+)*$/

const formSchema = [
  z.object({
    server_id: z.string(),
    name: z.string(),
    repo_name: z
      .string()
      .regex(
        repoNamePattern,
        'Repository name must be lowercase and can include hyphens or dots (kebab-case or domain-style)'
      ),
    repo_url: z.string(),
    site_url: z.union([z.string().url(), z.literal('')]).optional(),
    branch: z.string()
  }),
  z.object({
    env_vars: z.array(
      z.object({
        key: z
          .string()
          .min(1, 'Key is required')
          .regex(/^[A-Z_][A-Z0-9_]*$/, 'Invalid env key format'),
        value: z.string().optional()
      })
    )
  }),
  z.object({})
]

const currentStep = computed(() => steps[stepIndex.value - 1])

const currentSchema = computed(() => toTypedSchema(formSchema![stepIndex.value - 1]!))

const { handleSubmit, meta, validate } = useForm({
  validationSchema: currentSchema,
  initialValues: {
    server_id: appStore.serverID,
    name: '',
    repo_name: '',
    repo_url: '',
    site_url: '',
    branch: 'main',
    env_vars: []
  },
  keepValuesOnUnmount: true
})

const {
  fields: envVars,
  push: pushEnvVar,
  remove: removeEnvVar
} = useFieldArray<{
  key: string
  value?: string
}>('env_vars')

const { value } = useFormValues()

usePageMeta({
  title: 'Create New Application',
  breadcrumb: [
    {
      label: 'Applications',
      to: { name: 'applications' }
    },
    {
      label: 'Create New Application',
      to: { name: 'applications.Create' }
    }
  ]
})

const goNext = async (nextStep: () => void) => {
  const isValid = await validate()
  if (!isValid.valid) return
  nextStep()
}

const onSubmit = handleSubmit(async () => {
  const form = value as ApplicationCreateRequest
  const payload: ApplicationCreateRequest = {
    ...form,
    site_url: form.site_url?.trim() ? form.site_url.trim() : null
  }

  try {
    const res = await applicationStore.createApplication(payload)

    if (res.message && res.data?.id) {
      toast.success(res.message)
      router.push({
        name: 'applications.deploys',
        params: { id: res.data.id }
      })
    }
  } catch (error) {
    const fetchError = error as Error
    toast.error(fetchError.message)
  }
})
</script>

<template>
  <Stepper
    v-slot="{ isPrevDisabled, nextStep, prevStep, modelValue }"
    v-model="stepIndex"
    orientation="vertical"
    class="block w-full"
  >
    <div
      class="bg-card/30 border-border/50 flex w-full flex-col overflow-hidden rounded-2xl border backdrop-blur-md xl:flex-row"
    >
      <!-- Stepper Sidebar -->
      <div class="bg-card hidden w-full shrink-0 flex-col gap-8 p-10 xl:flex xl:w-96">
        <div class="mb-4">
          <h2 class="text-2xl font-black tracking-tight uppercase">Setup Engine</h2>
          <p class="text-muted-foreground text-xs font-black tracking-widest uppercase">
            Initialization Pipeline
          </p>
        </div>

        <StepperItem
          v-for="(item, index) in steps"
          :key="item.step"
          v-slot="{ state }"
          :step="item.step"
          class="group"
        >
          <div class="relative flex flex-col items-center">
            <StepperSeparator
              v-if="item.step !== steps[steps.length - 1]?.step"
              class="bg-border/20 group-data-[state=completed]:bg-primary absolute top-[44px] left-[18px] block h-[120%] w-0.5 shrink-0 rounded-full transition-colors duration-500"
            />

            <StepperTrigger
              :disabled="state !== 'completed' && index >= (modelValue || 0) && !meta.valid"
              class="relative"
            >
              <StepperIndicator
                v-slot="{ step }"
                class="border-border/50 bg-accent/50 group-data-[state=active]:border-primary group-data-[state=active]:bg-primary group-data-[state=active]:shadow-primary/20 group-data-[state=completed]:border-primary group-data-[state=completed]:bg-primary size-10 border-2 transition-all duration-300 group-data-[state=active]:shadow-lg"
              >
                <template v-if="item.icon">
                  <component
                    :is="item.icon"
                    :size="18"
                    :class="
                      state === 'active' || state === 'completed'
                        ? 'text-primary-foreground'
                        : 'text-muted-foreground'
                    "
                  />
                </template>
                <span v-else>{{ step }}</span>
              </StepperIndicator>
            </StepperTrigger>
          </div>

          <div class="flex flex-col gap-1 pt-1.5 pl-2">
            <StepperTitle
              class="text-sm font-black tracking-tight uppercase transition-colors"
              :class="state === 'active' ? 'text-primary' : 'text-muted-foreground/60'"
            >
              {{ item.title }}
            </StepperTitle>
            <StepperDescription class="text-xs font-medium tracking-widest uppercase opacity-40">
              {{ item.description }}
            </StepperDescription>
          </div>
        </StepperItem>
      </div>

      <!-- Form Content -->
      <div class="flex-1 p-10">
        <form
          class="mx-auto max-w-2xl"
          @submit="
            async (e) => {
              e.preventDefault()
              const isValid = await validate()
              if (stepIndex === steps.length && isValid.valid) {
                onSubmit()
              }
            }
          "
        >
          <div class="flex flex-col gap-10">
            <!-- Mobile Header -->
            <div class="flex items-center gap-4 xl:hidden">
              <div
                class="bg-primary text-primary-foreground shadow-primary/20 rounded-xl p-3 shadow-lg"
              >
                <component
                  :is="currentStep?.icon"
                  class="size-6"
                />
              </div>
              <div class="space-y-1">
                <div class="text-xl font-black tracking-tight uppercase">
                  {{ currentStep?.title }}
                </div>
                <div
                  class="text-muted-foreground text-xs font-black tracking-widest uppercase opacity-60"
                >
                  {{ currentStep?.description }}
                </div>
              </div>
            </div>

            <template v-if="stepIndex === 1">
              <div class="grid gap-6">
                <FormField
                  v-slot="{ componentField }"
                  name="name"
                >
                  <FormItem>
                    <FormLabel class="text-sm font-black tracking-widest uppercase"
                      >Application Identity</FormLabel
                    >
                    <FormControl>
                      <Input
                        class="border-border/50 rounded-xl px-4 py-6"
                        placeholder="e.g. HorizonX Dashboard"
                        v-bind="componentField"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>

                <div class="grid gap-6 md:grid-cols-2">
                  <FormField
                    v-slot="{ componentField }"
                    name="repo_name"
                  >
                    <FormItem>
                      <FormLabel class="text-sm font-black tracking-widest uppercase"
                        >Instance Identifier</FormLabel
                      >
                      <FormControl>
                        <Input
                          class="border-border/50 rounded-xl px-4 py-6 font-mono"
                          placeholder="kebab-case-id"
                          v-bind="componentField"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  </FormField>

                  <FormField
                    v-slot="{ componentField }"
                    name="branch"
                  >
                    <FormItem>
                      <FormLabel class="text-sm font-black tracking-widest uppercase"
                        >Target Branch</FormLabel
                      >
                      <FormControl>
                        <Input
                          class="border-border/50 rounded-xl px-4 py-6 font-mono"
                          placeholder="main"
                          v-bind="componentField"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  </FormField>
                </div>

                <FormField
                  v-slot="{ componentField }"
                  name="repo_url"
                >
                  <FormItem>
                    <FormLabel class="text-sm font-black tracking-widest uppercase"
                      >Source Repository</FormLabel
                    >
                    <FormControl>
                      <Input
                        class="border-border/50 rounded-xl px-4 py-6 font-mono"
                        placeholder="git@github.com:..."
                        v-bind="componentField"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>

                <FormField
                  v-slot="{ componentField }"
                  name="site_url"
                >
                  <FormItem>
                    <FormLabel class="text-sm font-black tracking-widest uppercase"
                      >Production URL (Optional)</FormLabel
                    >
                    <FormControl>
                      <Input
                        class="border-border/50 rounded-xl px-4 py-6"
                        placeholder="https://..."
                        v-bind="componentField"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>
              </div>
            </template>

            <template v-if="stepIndex === 2">
              <div class="border-border/50 rounded-2xl border">
                <Table>
                  <TableHeader>
                    <TableRow class="border-border/50 hover:bg-transparent">
                      <TableHead class="pl-6 text-xs font-black tracking-widest uppercase"
                        >Variable Key</TableHead
                      >
                      <TableHead class="text-xs font-black tracking-widest uppercase"
                        >Assigned Value</TableHead
                      >
                      <TableHead />
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    <TableRow
                      v-for="(field, index) in envVars"
                      :key="field.key"
                      class="border-border/20 hover:bg-transparent"
                    >
                      <TableCell class="pl-6">
                        <FormField
                          v-slot="{ componentField }"
                          :name="`env_vars.${index}.key`"
                        >
                          <FormItem>
                            <FormControl>
                              <Input
                                class="border-border/50 h-10 font-mono text-sm"
                                placeholder="KEY"
                                v-bind="componentField"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        </FormField>
                      </TableCell>

                      <TableCell>
                        <FormField
                          v-slot="{ componentField }"
                          :name="`env_vars.${index}.value`"
                        >
                          <FormItem>
                            <FormControl>
                              <Input
                                class="border-border/50 h-10 font-mono text-sm"
                                placeholder="VALUE"
                                v-bind="componentField"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        </FormField>
                      </TableCell>

                      <TableCell class="pr-6">
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          class="text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-lg"
                          @click="removeEnvVar(index)"
                        >
                          <XIcon class="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>

                    <TableRow class="hover:bg-transparent">
                      <TableCell
                        colspan="3"
                        class="p-6"
                      >
                        <Button
                          type="button"
                          variant="outline"
                          class="bg-accent/20 border-border/50 w-full rounded-xl border-dashed py-6 text-sm font-black tracking-tight uppercase"
                          @click="pushEnvVar({ key: '', value: '' })"
                        >
                          <PlusIcon class="mr-2 size-4" />
                          Inject New Variable
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </template>

            <template v-if="stepIndex === 3">
              <div class="space-y-6">
                <!-- Summary Header -->
                <div class="border-primary flex items-center gap-4 border-l-4 pl-6">
                  <div>
                    <h3 class="text-xl font-black tracking-tight uppercase">
                      Configuration Review
                    </h3>
                    <p class="text-xs font-black tracking-widest uppercase opacity-40">
                      Verify pipeline parameters before deployment
                    </p>
                  </div>
                </div>

                <div class="grid gap-4 md:grid-cols-2">
                  <!-- Project -->
                  <div class="border-border/50 rounded-xl border p-6">
                    <span
                      class="text-muted-foreground/60 mb-2 block text-xs font-black tracking-widest uppercase"
                      >Identity</span
                    >
                    <div class="text-sm font-bold tracking-tight uppercase">{{ value?.name }}</div>
                  </div>

                  <!-- Repository -->
                  <div class="border-border/50 rounded-xl border p-6">
                    <span
                      class="text-muted-foreground/60 mb-2 block text-xs font-black tracking-widest uppercase"
                      >Strategy</span
                    >
                    <div class="text-sm font-bold tracking-tight uppercase">
                      {{ value?.branch }} node
                    </div>
                  </div>

                  <div class="border-border/50 rounded-xl border p-6 md:col-span-2">
                    <span
                      class="text-muted-foreground/60 mb-2 block text-xs font-black tracking-widest uppercase"
                      >Source Control</span
                    >
                    <code class="font-mono text-xs font-medium opacity-60">{{
                      value?.repo_url || '—'
                    }}</code>
                  </div>

                  <!-- Env Vars -->
                  <div class="border-border/50 rounded-xl border p-6 md:col-span-2">
                    <span
                      class="text-muted-foreground/60 mb-4 block text-xs font-black tracking-widest uppercase"
                      >Environment Injection</span
                    >

                    <div
                      v-if="value?.env_vars?.length"
                      class="space-y-2"
                    >
                      <div
                        v-for="(env, i) in value.env_vars"
                        :key="i"
                        class="flex items-center justify-between rounded-lg border border-white/5 px-3 py-2 font-mono text-xs"
                      >
                        <span class="text-primary font-bold">{{ env.key }}</span>
                        <span class="text-muted-foreground">{{ env.value || '—' }}</span>
                      </div>
                    </div>

                    <div
                      v-else
                      class="text-muted-foreground/40 text-xs font-medium tracking-widest uppercase italic"
                    >
                      Empty environment stack
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <!-- Navigation Controls -->
            <div class="border-border/50 flex items-center justify-between border-t pt-10">
              <Button
                :disabled="isPrevDisabled"
                variant="ghost"
                class="rounded-full px-8 text-xs font-black tracking-tight uppercase"
                @click="prevStep()"
              >
                Previous Step
              </Button>
              <div class="flex items-center gap-4">
                <Button
                  v-if="stepIndex !== 3"
                  type="button"
                  class="bg-primary shadow-primary/20 rounded-full px-10 text-xs font-black tracking-tight uppercase shadow-lg transition-all active:scale-95"
                  @click="goNext(nextStep)"
                >
                  Proceed
                </Button>
                <Button
                  v-if="stepIndex === 3"
                  type="submit"
                  class="bg-primary shadow-primary/20 rounded-full px-12 text-xs font-black tracking-tight uppercase shadow-lg transition-all active:scale-95"
                >
                  Commit & Launch
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  </Stepper>
</template>
