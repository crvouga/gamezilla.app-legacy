import { join } from 'path'
import { type IFileSystem } from '~/@/file-system'

export type DotEnvPrecedence = 'overwrite-env-var' | 'skip-existing-env-var'
/**

 * Loads environment variables from a .env file
 */
const loadOne = async (config: { fs: IFileSystem; path: string; precedence: DotEnvPrecedence }): Promise<void> => {
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

      if (typeof process !== 'undefined' && process.env) {
        switch (config.precedence) {
          case 'overwrite-env-var':
            process.env[key] = cleanValue
            break
          case 'skip-existing-env-var':
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
 * Loads environment variables from a .env file
 */
const load = async (config: { fs: IFileSystem; paths: string[]; precedence: DotEnvPrecedence }): Promise<void> => {
  for (const path of config.paths) {
    await loadOne({ fs: config.fs, path, precedence: config.precedence })
  }
}

export const DotEnv = {
  load,
}
