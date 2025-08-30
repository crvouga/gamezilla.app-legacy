import { join } from 'path'
import { IFileSystem } from '../file-system/interface'
import { isErr } from '../result'

export type DotEnvPrecedence = 'override-process-env' | 'preserve-process-env'

/**
 * Loads environment variables from a single .env file
 * @private
 */
const loadOne = async (config: { fs: IFileSystem; path: string; precedence: DotEnvPrecedence }): Promise<void> => {
  // Try the path as-is first (for in-memory), then try with cwd
  let envPath = config.path
  let existsResult = await config.fs.exists(envPath)

  if (isErr(existsResult) || !existsResult.value) {
    // Try with full path
    envPath = join(process.cwd(), config.path)
    existsResult = await config.fs.exists(envPath)
    if (isErr(existsResult) || !existsResult.value) {
      return
    }
  }

  try {
    const readResult = await config.fs.read(envPath)
    if (isErr(readResult)) {
      console.warn('Error reading .env file:', readResult.error)
      return
    }

    const stream = readResult.value
    const reader = stream.getReader()
    const decoder = new TextDecoder()
    let contents = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const uint8Array = value instanceof Uint8Array ? value : new Uint8Array(value as ArrayBuffer)
        contents += decoder.decode(uint8Array, { stream: true })
      }
      contents += decoder.decode()
    } finally {
      reader.releaseLock()
    }

    const lines = contents.split('\n')

    for (const line of lines) {
      const trimmed = line.trim()

      if (!trimmed || trimmed.startsWith('#')) {
        continue
      }

      const equalIndex = trimmed.indexOf('=')
      if (equalIndex === -1) {
        continue
      }

      const key = trimmed.substring(0, equalIndex).trim()
      const value = trimmed.substring(equalIndex + 1).trim()

      if (!key || !value) {
        continue
      }

      // Remove quotes from value if present
      const cleanValue = value.replace(/^['"](.*)['"]$/, '$1')

      if (typeof process !== 'undefined' && process.env) {
        switch (config.precedence) {
          case 'override-process-env':
            process.env[key] = cleanValue
            break
          case 'preserve-process-env':
            if (process.env[key] === undefined) {
              process.env[key] = cleanValue
            }
            break
        }
      }
    }
  } catch (err) {
    console.warn('Error loading .env file:', err)
  }
}

/**
 * Loads environment variables from .env files
 *
 * @example
 * // Load from single .env file, overriding existing env vars
 * await DotEnv.load({
 *   fs: FileSystem.init({ t: 'node' }),
 *   paths: ['.env'],
 *   precedence: 'override-process-env'
 * })
 *
 * @example
 * // Load from multiple files, preserving existing env vars
 * await DotEnv.load({
 *   fs: FileSystem.init({ t: 'node' }),
 *   paths: ['.env', '.env.local'],
 *   precedence: 'preserve-process-env'
 * })
 *
 * @example
 * // Example .env file contents:
 * // # Comments are ignored
 * // API_KEY=abc123
 * // DATABASE_URL="postgres://user:pass@localhost:5432/db"
 * // Empty lines are ignored
 * // PORT=3000
 */
const load = async (config: { fs: IFileSystem; paths: string[]; precedence: DotEnvPrecedence }): Promise<void> => {
  for (const path of config.paths) {
    await loadOne({ ...config, path })
  }
}

export const DotEnv = {
  load,
}
