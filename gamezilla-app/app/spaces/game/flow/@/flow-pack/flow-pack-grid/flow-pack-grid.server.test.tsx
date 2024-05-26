import { describe, expect, it } from "bun:test";
import { AppServerModule } from "gamezilla-app/app/@/architecture/app-server";
import { didSendToClient } from "gamezilla-app/app/@/server";
import { SpaceServerCtx } from "gamezilla-app/app/spaces/@/space";
import {
	randomAuthenticatedClient,
	type AuthenticatedClient,
} from "gamezilla-app/app/spaces/@/testing/server";
import { SpaceGameFixtureServer } from "gamezilla-app/app/spaces/game/@/testing/server";
import { FlowPack, FlowPackDb } from "..";
import type { FlowServerDeps } from "../../../builder/builder.types";
import { FlowPuzzle, FlowPuzzleDb } from "../../flow-puzzle";
import type { FlowPuzzleId } from "../../flow-puzzle/flow-puzzle-id";

import type { ModelServer } from "./flow-pack-grid.types";
import { FlowPackGridServer } from "./flow-pack-grid.server";

const initial = () => {
	return {
		model: {},
	};
};

const userObversedGrid =
	(
		deps: FlowServerDeps,
		ctx: SpaceServerCtx,
		client: AuthenticatedClient,
		puzzleIds: FlowPuzzleId[],
	) =>
	(model: ModelServer) => {
		return FlowPackGridServer.update({
			ctx,
			model,
			deps,
			msgClient: {
				...client,
				puzzleIds,
				t: "list-puzzles-by-id",
			},
		});
	};

const Fixture = async () => {
	const deps: FlowServerDeps = {
		flowPackDb: FlowPackDb({ t: "hash-map" }),
		flowPuzzleDb: FlowPuzzleDb({ t: "hash-map" }),
	};
	const f = await SpaceGameFixtureServer();
	const client = randomAuthenticatedClient();
	const puzzle = await FlowPuzzle.random();
	const somePack = await FlowPack.create({
		createdBy: client.userId,
		now: f.ctx.now,
		puzzleIds: [puzzle.id],
	});

	await deps.flowPuzzleDb.put(puzzle);
	await deps.flowPackDb.put(somePack);

	return { ...f, client, deps };
};

describe(import.meta.file, () => {
	it("should send back listed puzzles", async () => {
		const f = await Fixture();
		const output = await AppServerModule.andThen(
			initial(),
			userObversedGrid(f.deps, f.ctx, f.client, []),
		);

		expect(
			didSendToClient(
				output,
				f.client.clientId,
				(msg) => msg.t === "listed-puzzles-by-id",
			),
		).toBe(true);
	});
});
