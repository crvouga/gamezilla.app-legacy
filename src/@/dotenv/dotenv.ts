import { join } from 'path'
import { type IFileSystem } from '~/@/file-system'

/**
 * Loads environment variables from a .env file
 */
const load = async (config: { fs: IFileSystem; path?: string }): Promise<void> => {
  // Get project root directory
  const projectRoot = process.cwd()

  // Join with provided path or default .env
  const envPath = join(projectRoot, config.path ?? '.env')

  // Check if file exists first
  const exists = await config.fs.exists(envPath)
  if (!exists) {
    return
  }

  try {
    // Read file as stream and convert to text
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
      contents += decoder.decode() // Flush final chunk
    } finally {
      reader.releaseLock()
    }

    const lines = contents.split('\n')

    for (const line of lines) {
      const trimmed = line.trim()

      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('#')) {
        continue
      }

      // Parse key=value pairs
      const [key, ...valueParts] = trimmed.split('=')
      const value = valueParts.join('=') // Handle values containing = signs

      if (!key || !value) {
        continue
      }

      // Remove quotes if present
      const cleanValue = value.replace(/^['"](.*)['"]$/, '$1')

      // Set environment variable if not already set
      if (!process.env[key]) {
        process.env[key] = cleanValue
      }
    }
  } catch (err) {
    // Silently handle errors to prevent failure
    console.warn('Error loading .env file:', err)
  }
}

export const DotEnv = {
  load,
}
