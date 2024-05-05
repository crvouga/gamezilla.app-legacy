import { ServerTestEnv } from "gamezilla-app/app/@/server/server-test-env";
import {
	SpaceGameServerFixture,
	testSpaceServerCtx,
} from "../../../../@/testing/server";
import { FlowPackDb } from "../../../@/flow-pack/flow-pack-db";
import { FlowPuzzleDb } from "../../../@/flow-puzzle/flow-puzzle-db";
import { type FlowServerDeps, initServer } from "../../create.core";
import { initSync } from "../../create.sync";

export const initial = {
	model: initServer,
};

export const defaultModelSync = initSync({
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

export const FlowCreateFixture = async () => {
	const f = await SpaceGameServerFixture();
	const deps = await getDeps();
	const model = initServer;
	const modelSync = defaultModelSync;
	return {
		...f,
		deps,
		model,
		modelSync,
	};
};
