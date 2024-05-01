import type { ILogger } from "./logger";

export const loggerNoop: ILogger = {
	info: () => {},
	warn: () => {},
	error: () => {},
	debug: () => {},
	trace: () => {},
	fatal: () => {},
};
