import { CODEBASE_VERSION_ID, SERVER_IMPL, SERVER_PORT } from "public-config";
import { ProgramImpure } from "./@/core/program-impure";
import { Server } from "./@/server";
import { ILogger, Logger } from "./app/@/server/logger";
import * as AppServer from "./app/app.server";

const main = async () => {
	const logger = ILogger.prefix("app", Logger({ t: "console" }));

	const server = Server({
		t: SERVER_IMPL,
		logger: ILogger.prefix("server", logger),
	});

	const deps = await AppServer.getDeps({
		codebaseVersionId: CODEBASE_VERSION_ID,
		server,
		logger,
	});

	await ProgramImpure.run({
		ctx: AppServer.ctx,

		init: (input) => AppServer.init({ ...input, deps }),

		update: (input) => AppServer.update({ ...input, model: null, deps }),

		subscriptions: (input) =>
			AppServer.subscriptions({ ...input, model: null, deps }),
	});

	await server.start(SERVER_PORT);
};

main();
