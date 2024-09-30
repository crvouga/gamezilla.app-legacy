import type { ILogger } from '../logger/logger'

export const logQuery = (input: { sql: string; start: number; end: number; logger: ILogger }) => {
  const durationFormatted = `${input.end - input.start}ms`
  input.logger.info(`duration=${durationFormatted}\nsql=\n${input.sql.slice(0, 1000)}`)
}
