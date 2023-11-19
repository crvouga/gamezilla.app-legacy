import { Logger } from "../../@SHARED/server/logger";

export function logQuery({
  sql,
  start,
  end,
  logger,
}: {
  sql: string;
  start: number;
  end: number;
  logger: Logger;
}) {
  const durationFormatted = `${end - start}ms`;

  logger.info(`[db] duration=${durationFormatted} sql=\n${sql}\n`);
}
