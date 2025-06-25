import { describe, expect, it } from 'bun:test'
import { spawn } from 'bun'
import { existsSync } from 'fs'
import { resolve } from 'path'

describe('Frontend Build', () => {
  it('should build frontend successfully', async () => {
    const proc = spawn(['bun', 'x', 'vite', 'build'], { cwd: process.cwd(), stdout: 'pipe', stderr: 'pipe' })

    const result = await proc.exited

    expect(result).toBe(0)

    const distPath = resolve(process.cwd(), 'dist')
    expect(existsSync(distPath)).toBe(true)

    const indexHtmlPath = resolve(distPath, 'index.html')
    expect(existsSync(indexHtmlPath)).toBe(true)
  }, 60000)
})
