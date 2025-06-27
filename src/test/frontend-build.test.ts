import { spawn } from 'bun'
import { describe, expect, it } from 'bun:test'
import { existsSync } from 'fs'
import { resolve } from 'path'
import { CONFIG_SHARED } from '~/config/shared'

describe('Frontend Build (Integration)', () => {
  it.skipIf(CONFIG_SHARED.IS_UNIT_TEST)(
    'should build frontend successfully',
    async () => {
      const proc = spawn(['bun', 'frontend:build'], { cwd: process.cwd(), stdout: 'pipe', stderr: 'pipe' })

      const result = await proc.exited

      expect(result).toBe(0)

      const distPath = resolve(process.cwd(), 'dist')
      expect(existsSync(distPath)).toBe(true)

      const indexHtmlPath = resolve(distPath, 'index.html')
      expect(existsSync(indexHtmlPath)).toBe(true)
    },
    60000,
  )
})
