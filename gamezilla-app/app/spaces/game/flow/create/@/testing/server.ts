import { ServerTestEnv } from "gamezilla-app/app/@/server/server-test-env";
import {
	SpaceGameFixtureServer,
	testSpaceServerCtx,
} from "../../../../@/testing/server";
import { FlowPackDb } from "../../../@/flow-pack/flow-pack-db";
import { FlowPuzzleDb } from "../../../@/flow-puzzle/flow-puzzle-db";
import { initServer, type FlowServerDeps } from "../../create.core";
import { CreateCore } from "../../create.sync";

export const initial = {
	model: initServer,
};

export const defaultModelCore = CreateCore.initCore({
	ctx: testSpaceServerCtx,
});

export const getDeps = async (): Promise<FlowServerDeps> => {
	const testEnv = await ServerTestEnv();
	switch (testEnv.t) {
		case "integration": {
			return {
				FlowPackDb: FlowPackDb({
					t: "db-conn-sql",
					dbConnSql: testEnv.dbConnSql,
				}),
				FlowPuzzleDb: FlowPuzzleDb({
					t: "db-conn-sql",
					dbConnSql: testEnv.dbConnSql,
				}),
			};
		}
		case "unit": {
			return {
				FlowPackDb: FlowPackDb({
					t: "hash-map",
				}),
				FlowPuzzleDb: FlowPuzzleDb({
					t: "hash-map",
				}),
			};
		}
	}
};

export const FlowCreateFixtureServer = async () => {
	const f = await SpaceGameFixtureServer();
	const deps = await getDeps();
	const model = initServer;
	const modelCore = CreateCore.initCore({
		ctx: f.ctx,
	});
	return {
		...f,
		deps,
		model,
		modelCore,
	};
};
