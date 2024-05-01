export type ILogger = {
	info: (msg: string) => void;
	warn: (msg: string) => void;
	error: (msg: string) => void;
	debug: (msg: string) => void;
	trace: (msg: string) => void;
	fatal: (msg: string) => void;
};

const prefix = (prefix: string, logger: ILogger): ILogger => {
	return {
		debug(msg) {
			logger.debug(`[${prefix}] ${msg}`);
		},
		error(msg) {
			logger.error(`[${prefix}] ${msg}`);
		},
		fatal(msg) {
			logger.fatal(`[${prefix}] ${msg}`);
		},
		info(msg) {
			logger.info(`[${prefix}] ${msg}`);
		},
		trace(msg) {
			logger.trace(`[${prefix}] ${msg}`);
		},
		warn(msg) {
			logger.warn(`[${prefix}] ${msg}`);
		},
	};
};

export const ILogger = {
	prefix,
};
