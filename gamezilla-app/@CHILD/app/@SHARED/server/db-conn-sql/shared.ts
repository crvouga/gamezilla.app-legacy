import { Logger } from "../logger"

export function logQuery({
  sql,
  start,
  end,
  logger,
}: {
  sql: string
  start: number
  end: number
  logger: Logger
}) {
  const durationFormatted = `${end - start}ms`

  logger.info(
    `[db-sql] duration=${durationFormatted} sql=\n${sql.slice(0, 1000)}`,
  )
}
