<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { toTypedSchema } from '@vee-validate/zod'
import {
  CheckCircleIcon,
  FolderIcon,
  PlusIcon,
  SlidersIcon,
  TerminalIcon,
  XIcon
} from 'lucide-vue-next'
import { useFieldArray, useForm, useFormValues } from 'vee-validate'
import { toast } from 'vue-sonner'
import z from 'zod'
import DockerComposeCode from '@/components/DockerComposeCode.vue'
import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
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
import { Textarea } from '@/components/ui/textarea'
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
    title: 'Build Configuration',
    description: 'Configure how you app is built',
    icon: TerminalIcon
  },
  {
    step: 3,
    title: 'Environment Variables',
    description: 'Set required runtime variables',
    icon: SlidersIcon
  },
  {
    step: 4,
    title: 'Finalize',
    description: 'Review and finalize you setup',
    icon: CheckCircleIcon
  }
]

const formSchema = [
  z.object({
    server_id: z.string(),
    name: z.string(),
    repo_url: z.string(),
    branch: z.string()
  }),
  z.object({
    docker_compose_raw: z.string()
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

  try {
    const res = await applicationStore.createApplication(form)

    if (res.message) {
      toast.success(res.message)
      router.push({ name: 'applications' })
    }
  } catch (error) {
    const fetchError = error as Error
    toast.error(fetchError.message)
  }
})
</script>

<template>
  <Stepper
    v-model="stepIndex"
    orientation="vertical"
    class="block w-full"
    v-slot="{ isPrevDisabled, nextStep, prevStep, modelValue }"
  >
    <div class="border-accent flex w-full items-start justify-start gap-4 rounded-lg border p-8">
      <div class="hidden w-lg flex-col gap-8 xl:flex">
        <StepperItem
          v-for="(item, index) in steps"
          :key="item.step"
          :step="item.step"
          v-slot="{ state }"
        >
          <div class="relative flex flex-col items-center">
            <StepperSeparator
              v-if="item.step !== steps[steps.length - 1]?.step"
              class="bg-muted group-data-[state=completed]:bg-primary absolute top-[38px] left-[18px] block h-[105%] w-0.5 shrink-0 rounded-full"
            />

            <StepperTrigger
              :disabled="state !== 'completed' && index >= (modelValue || 0) && !meta.valid"
            >
              <StepperIndicator
                v-slot="{ step }"
                class="bg-muted"
              >
                <template v-if="item.icon">
                  <component
                    :is="item.icon"
                    class="h-4 w-4"
                  />
                </template>
                <span v-else>{{ step }}</span>
              </StepperIndicator>
            </StepperTrigger>
          </div>

          <div class="flex flex-col gap-1 pt-0.5">
            <StepperTitle>
              {{ item.title }}
            </StepperTitle>
            <StepperDescription>
              {{ item.description }}
            </StepperDescription>
          </div>
        </StepperItem>
      </div>

      <form
        class="w-full"
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
        <div class="mt-4 flex flex-col gap-8">
          <div class="flex items-center gap-4 xl:hidden">
            <div class="bg-foreground text-background rounded-full p-2">
              <component
                :is="currentStep?.icon"
                class="size-4"
              />
            </div>
            <div class="space-y-1">
              <div class="text-base font-bold">{{ currentStep?.title }}</div>
              <div class="text-xs text-neutral-400">{{ currentStep?.description }}</div>
            </div>
          </div>

          <template v-if="stepIndex === 1">
            <FormField
              v-slot="{ componentField }"
              name="name"
            >
              <FormItem>
                <FormLabel>Application Name</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="e.g. horizonx-dashboard"
                    v-bind="componentField"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField
              v-slot="{ componentField }"
              name="repo_url"
            >
              <FormItem>
                <FormLabel>Git Repository</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="git@github.com:username/repository.git"
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
                <FormLabel>Deployment Branch</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="main"
                    v-bind="componentField"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
          </template>

          <template v-if="stepIndex === 2">
            <FormField
              v-slot="{ componentField }"
              name="docker_compose_raw"
            >
              <FormItem>
                <FormLabel>Docker Compose Configuration</FormLabel>
                <FormControl>
                  <Textarea
                    rows="16"
                    placeholder="Paste your docker-compose.yml configuration here"
                    class="font-mono text-sm"
                    v-bind="componentField"
                  />
                </FormControl>
                <FormDescription>
                  This configuration will be used to build and run your application containers.
                </FormDescription>
              </FormItem>
            </FormField>
          </template>

          <template v-if="stepIndex === 3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead class="w-4/12">Key</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>

              <TableBody>
                <TableRow
                  v-for="(field, index) in envVars"
                  :key="field.key"
                >
                  <TableCell>
                    <FormField
                      :name="`env_vars.${index}.key`"
                      v-slot="{ componentField }"
                    >
                      <FormItem>
                        <FormControl>
                          <Input
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
                      :name="`env_vars.${index}.value`"
                      v-slot="{ componentField }"
                    >
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="VALUE"
                            v-bind="componentField"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    </FormField>
                  </TableCell>

                  <TableCell>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      @click="removeEnvVar(index)"
                    >
                      <XIcon />
                    </Button>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell colspan="3">
                    <Button
                      variant="outline"
                      @click="pushEnvVar({ key: '', value: '' })"
                    >
                      <PlusIcon />
                      Add Variable
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </template>

          <template v-if="stepIndex === 4">
            <div class="space-y-6">
              <!-- Project -->
              <div class="rounded-lg border p-4">
                <h3 class="mb-2 font-semibold">Project</h3>
                <div class="text-muted-foreground space-y-1 text-sm">
                  <div><strong>Name:</strong> {{ value?.name }}</div>
                </div>
              </div>

              <!-- Repository -->
              <div class="rounded-lg border p-4">
                <h3 class="mb-2 font-semibold">Repository</h3>
                <div class="text-muted-foreground space-y-1 text-sm">
                  <div><strong>URL:</strong> {{ value?.repo_url }}</div>
                  <div><strong>Branch:</strong> {{ value?.branch }}</div>
                </div>
              </div>

              <!-- Build -->
              <div class="rounded-lg border p-4">
                <h3 class="mb-2 font-semibold">Build Configuration</h3>
                <template v-if="value?.docker_compose_raw">
                  <DockerComposeCode :code="value.docker_compose_raw" />
                </template>
              </div>

              <!-- Env Vars -->
              <div class="rounded-lg border p-4">
                <h3 class="mb-2 font-semibold">Environment Variables</h3>

                <div
                  v-if="value?.env_vars?.length"
                  class="space-y-1 text-sm"
                >
                  <div
                    v-for="(env, i) in value.env_vars"
                    :key="i"
                    class="flex items-center justify-between font-mono"
                  >
                    <span>{{ env.key }}</span>
                    <span class="text-muted-foreground">
                      {{ env.value || '—' }}
                    </span>
                  </div>
                </div>

                <div
                  v-else
                  class="text-muted-foreground text-sm italic"
                >
                  No environment variables
                </div>
              </div>
            </div>
          </template>

          <div class="flex items-center justify-between">
            <Button
              :disabled="isPrevDisabled"
              variant="outline"
              size="sm"
              @click="prevStep()"
            >
              Back
            </Button>
            <div class="flex items-center gap-3">
              <Button
                v-if="stepIndex !== 4"
                type="button"
                size="sm"
                @click="goNext(nextStep)"
              >
                Next
              </Button>
              <Button
                v-if="stepIndex === 4"
                size="sm"
                type="submit"
              >
                Create
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  </Stepper>
</template>
