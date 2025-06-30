import { join } from 'path'
import { type IFileSystem } from '~/@/file-system'

/**
 * Loads environment variables from a .env file
 */
const load = async (config: { fs: IFileSystem; path?: string }): Promise<void> => {
  const projectRoot = process.cwd()

  const envPath = join(projectRoot, config.path ?? '.env')

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

      if (!process.env[key]) {
        process.env[key] = cleanValue
      }
    }
  } catch (err) {
    console.warn('Error loading .env file:', err)
  }
}

export const DotEnv = {
  load,
}
