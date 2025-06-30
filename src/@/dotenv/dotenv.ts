import { join } from 'path'
import { type IFileSystem } from '~/@/file-system'

/**
 * Loads environment variables from a .env file
 */
const loadOne = async (config: { fs: IFileSystem; path: string }): Promise<void> => {
  const envPath = join(process.cwd(), config.path)

  const exists = await config.fs.exists(envPath)
  if (!exists) {
    return
  }

  try {
    const stream = await config.fs.read(envPath)
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

      const [key, ...valueParts] = trimmed.split('=')
      const value = valueParts.join('=')

      if (!key || !value) {
        continue
      }

      const cleanValue = value.replace(/^['"](.*)['"]$/, '$1')

      if (typeof process !== 'undefined' && process.env && !process.env[key]) {
        process.env[key] = cleanValue
      }
    }
  } catch (err) {
    console.warn('Error loading .env file:', err)
  }
}

/**
 * Loads environment variables from a .env file
 */
const load = async (config: { fs: IFileSystem; paths: string[] }): Promise<void> => {
  for (const path of config.paths) {
    await loadOne({ fs: config.fs, path })
  }
}

export const DotEnv = {
  load,
}
