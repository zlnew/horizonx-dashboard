import pluginVitest from '@vitest/eslint-plugin'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import { globalIgnores } from 'eslint/config'

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}']
  },

  globalIgnores([
    '**/dist/**',
    '**/dist-ssr/**',
    '**/coverage/**',
    '**/node_modules/**',
    '**/components/ui/**',
    'vite.config.{js,ts}',
    'vitest.config.{js,ts}'
  ]),

  ...pluginVue.configs['flat/essential'],
  ...pluginVue.configs['flat/strongly-recommended'],
  ...pluginVue.configs['flat/recommended'],
  vueTsConfigs.recommended,

  {
    ...pluginVitest.configs.recommended,
    files: ['src/**/__tests__/*']
  },

  {
    name: 'app/vue-rules',
    files: ['**/*.vue'],
    rules: {
      'vue/custom-event-name-casing': ['error', 'kebab-case'],
      'vue/no-v-html': 'warn',
      'vue/html-self-closing': [
        'error',
        {
          html: {
            component: 'always',
            normal: 'always',
            void: 'always'
          },
          math: 'always',
          svg: 'always'
        }
      ],
      'vue/max-attributes-per-line': [
        'error',
        {
          multiline: 1,
          singleline: 3
        }
      ]
    }
  },

  {
    name: 'app/shadcn-ui-rules',
    files: ['src/components/ui/**/*.{ts,vue}'],
    rules: {
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off'
    }
  },

  skipFormatting
)
