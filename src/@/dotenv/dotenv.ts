import { join } from 'path'
import { IFileSystem } from '../file-system/interface'
import { isErr } from '../result'
import { Logger } from '../logger'
import type { ILogger } from '../logger/interface'

export type DotEnvPrecedence = 'override' | 'preserve'

export interface DotEnvConfig {
  fs: IFileSystem
  paths: string[]
  precedence: DotEnvPrecedence
  cwd: string
  env: Record<string, string | undefined>
  logger?: ILogger
}

/**
 * Loads environment variables from a single .env file
 * @private
 */
const loadOne = async (config: {
  fs: IFileSystem
  path: string
  precedence: DotEnvPrecedence
  cwd: string
  env: Record<string, string | undefined>
  logger: ILogger
}): Promise<void> => {
  // Instead of prefixing all log messages with [DotEnv], use logger.child if available
  const logger: ILogger = config.logger.child(['dotenv'])

  // Try the path as-is first (for in-memory), then try with cwd
  let envPath = config.path
  let existsResult = await config.fs.exists(envPath)

  if (isErr(existsResult) || !existsResult.value) {
    // Try with full path
    envPath = join(config.cwd, config.path)
    existsResult = await config.fs.exists(envPath)
    if (isErr(existsResult) || !existsResult.value) {
      logger.debug(`File not found: ${config.path} (tried ${config.path} and ${envPath})`)
      return
    }
  }

  logger.info(`Loading .env file: ${envPath}`)

  try {
    const readResult = await config.fs.read(envPath)
    if (isErr(readResult)) {
      logger.error(`Error reading .env file: ${envPath}`, readResult.error)
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

    let countParsed = 0
    for (const line of lines) {
      const trimmed = line.trim()

      if (!trimmed || trimmed.startsWith('#')) {
        logger.trace(`Skipping comment/empty line: ${line}`)
        continue
      }

      const equalIndex = trimmed.indexOf('=')
      if (equalIndex === -1) {
        logger.warn(`Skipping invalid line (missing '='): "${line}"`)
        continue
      }

      const key = trimmed.substring(0, equalIndex).trim()
      const value = trimmed.substring(equalIndex + 1).trim()

      if (!key || !value) {
        logger.warn(`Skipping invalid line (empty key or value): "${line}"`)
        continue
      }

      // Remove quotes from value if present
      const cleanValue = value.replace(/^['"](.*)['"]$/, '$1')

      switch (config.precedence) {
        case 'override':
          config.env[key] = cleanValue
          logger.debug(`Set/override env var: ${key}`)
          countParsed++
          break
        case 'preserve':
          if (config.env[key] === undefined) {
            config.env[key] = cleanValue
            logger.debug(`Set (preserved) env var: ${key}`)
            countParsed++
          } else {
            logger.trace(`Skipped (preserved existing) env var: ${key}`)
          }
          break
      }
    }
    logger.info(`Loaded ${countParsed} env var(s) from ${envPath}`)
  } catch (err) {
    logger.error(`Error loading .env file: ${envPath}`, err)
  }
}

/**
 * Loads environment variables from .env files
 *
 * @example
 * // Load from single .env file, overriding existing env vars
 * await DotEnv.load({
 *   logger: Logger.init({ t: 'noop' }),
 *   fs: FileSystem.init({ t: 'node' }),
 *   paths: ['.env'],
 *   precedence: 'override',
 *   cwd: process.cwd(),
 *   env: process.env,
 * })
 *
 * @example
 * // Load from multiple files, preserving existing env vars
 * await DotEnv.load({
 *   logger: Logger.init({ t: 'noop' }),
 *   fs: FileSystem.init({ t: 'node' }),
 *   paths: ['.env', '.env.local'],
 *   precedence: 'preserve',
 *   cwd: process.cwd(),
 *   env: process.env,
 * })
 *
 * @example
 * // Load into a custom environment object
 * const customEnv: Record<string, string | undefined> = {}
 * await DotEnv.load({
 *   logger: Logger.init({ t: 'noop' }),
 *   fs: FileSystem.init({ t: 'in-memory' }),
 *   paths: ['.env'],
 *   precedence: 'override',
 *   cwd: '/custom/path',
 *   env: customEnv,
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
const load = async (config: DotEnvConfig): Promise<void> => {
  const logger: ILogger = (config.logger ?? Logger.init({ t: 'noop' })).child(['dotenv'])
  logger.info('Start loading .env files', config.paths)
  for (const path of config.paths) {
    await loadOne({ ...config, path, logger })
  }
  logger.info('Finished loading .env files')
}

export const DotEnv = {
  load,
}
