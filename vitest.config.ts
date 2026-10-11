import { fileURLToPath } from 'node:url'
import { configDefaults, defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default defineConfig((env) => {
  const viteConfigResolved = typeof viteConfig === 'function' ? viteConfig(env) : viteConfig

  return mergeConfig(
    viteConfigResolved,
    defineConfig({
      test: {
        environment: 'jsdom',
        // Both spellings on purpose: the spec lives at tests/e2e/**, while a
        // bare e2e/** glob is the conventional one for this template. Missing
        // the tests/ prefix is what previously let vitest try to load a
        // Playwright spec and fail on resolving its import.
        exclude: [...configDefaults.exclude, 'e2e/**', 'tests/e2e/**'],
        root: fileURLToPath(new URL('./', import.meta.url))
      }
    })
  )
})
