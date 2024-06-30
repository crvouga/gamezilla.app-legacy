import { Sub } from "gamezilla-app/@/core";
import { GameServerModule } from "gamezilla-app/app/spaces/@/architecture/game-server-v2";
import { SpaceServerCmd } from "gamezilla-app/app/spaces/@/space-server-cmd";
import { FlowPackDb } from "../@/flow-pack/flow-pack-db";
import { FlowPackListServer } from "../@/flow-pack/flow-pack-list";
import { FlowPuzzleDb } from "../@/flow-puzzle/flow-puzzle-db";
import { FlowPuzzleListServer } from "../@/flow-puzzle/flow-puzzle-list";
import { initServer, type ServerModule } from "./builder.types";
import { PackServer } from "./pack/pack.server";
import { PuzzleServer } from "./puzzle/puzzle.server";
import { Logger } from "gamezilla-app/app/@/server/logger";

const deps: ServerModule["deps"] = async (input) => {
	return {
		flowPuzzleDb: FlowPuzzleDb({
			t: "db-conn-sql",
			dbConnSql: input.ctx.dbConnSql,
			logger: Logger({ t: "noop" })
		}),
		flowPackDb: FlowPackDb({
			t: "db-conn-sql",
			dbConnSql: input.ctx.dbConnSql,
		}),
	};
};

const update: ServerModule["update"] = async (input) => {
	return GameServerModule.andThen(
		{ model: input.model },
		(model) => PuzzleServer.update({ ...input, model }),
		(model) => PackServer.update({ ...input, model }),
		(model) => updateFlowPackList({ ...input, model }),
		(model) => updateFlowPuzzleList({ ...input, model }),
	);
};

const updateFlowPuzzleList: ServerModule["update"] = async (input) => {
	const updated = await FlowPuzzleListServer.update({
		...input,
		model: input.model.flowPackList,
		msg: input.msg?.t === "flow-puzzle-list" ? input.msg.c : undefined,
		msgClient:
			input.msgClient?.t === "flow-puzzle-list"
				? { ...input.msgClient, ...input.msgClient.c }
				: undefined,
	});

	return {
		model: {
			...input.model,
			flowPackList: updated.model,
		},
		msgCmd: SpaceServerCmd.tag("flow-puzzle-list", updated.msgCmd),
	};
};

const updateFlowPackList: ServerModule["update"] = async (input) => {
	const updated = await FlowPackListServer.update({
		...input,
		model: input.model.flowPackList,
		msg: input.msg?.t === "flow-pack-list" ? input.msg.c : undefined,
		msgClient:
			input.msgClient?.t === "flow-pack-list"
				? { ...input.msgClient, ...input.msgClient.c }
				: undefined,
	});
	return {
		model: {
			...input.model,
			flowPackList: updated.model,
		},
		msgCmd: SpaceServerCmd.tag("flow-pack-list", updated.msgCmd),
	};
};

const subscriptions: ServerModule["subscriptions"] = async () => {
	return Sub.None;
};

export const BuilderServer: ServerModule = {
	deps,
	init: initServer,
	update,
	subscriptions,
};
