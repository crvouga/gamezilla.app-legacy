import type { ILogger } from "../logger/logger";

export function logQuery({
	sql,
	start,
	end,
	logger,
}: {
	sql: string;
	start: number;
	end: number;
	logger: ILogger;
}) {
	const durationFormatted = `${end - start}ms`;

	logger.info(`duration=${durationFormatted} sql=\n${sql.slice(0, 1000)}`);
}
