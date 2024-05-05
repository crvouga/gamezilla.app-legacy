import { describe, expect, it } from "bun:test";
import { AppServerModule } from "gamezilla-app/app/@/architecture/app-server";
import { didSendToClient } from "gamezilla-app/app/@/server";
import {
	type AuthenticatedClient,
	generateAuthClient,
} from "gamezilla-app/app/spaces/@/testing/server";
import { FlowPack, FlowPackDb } from "..";
import { testSpaceServerCtx } from "../../../../@/testing/server";
import type { FlowServerDeps } from "../../../create/create.types";
import { FlowVariant, FlowVariantDimensions } from "../../flow";
import { FlowPuzzle, FlowPuzzleDb } from "../../flow-puzzle";
import type { FlowPuzzleId } from "../../flow-puzzle/flow-puzzle-id";
import type { ModelServer } from "./flow-pack-grid.core";
import { FlowPackGridServer } from "./flow-pack-grid.server";

const initial = () => {
	return {
		model: {},
	};
};

const userObversedGrid =
	(
		deps: FlowServerDeps,
		client: AuthenticatedClient,
		puzzleIds: FlowPuzzleId[],
	) =>
	(model: ModelServer) => {
		return FlowPackGridServer.update({
			ctx: testSpaceServerCtx,
			model,
			deps,
			msgClient: {
				...client,
				puzzleIds,
				t: "list-puzzles-by-id",
			},
		});
	};

const createDeps = async (
	client: AuthenticatedClient,
): Promise<FlowServerDeps> => {
	const deps: FlowServerDeps = {
		FlowPackDb: FlowPackDb({ t: "hash-map" }),
		FlowPuzzleDb: FlowPuzzleDb({ t: "hash-map" }),
	};

	const puzzle = await FlowPuzzle.create({
		createdBy: client.userId,
		count: 1,
		createdAt: testSpaceServerCtx.now,
		flow: FlowVariant.init({
			dimensions: FlowVariantDimensions.init({
				t: "flow-grid",
				height: 5,
				width: 5,
			}),
			terminalsByGroupId: {},
		}),
	});

	const somePack = await FlowPack.create({
		createdBy: client.userId,
		now: testSpaceServerCtx.now,
		puzzleIds: [puzzle.id],
	});

	await deps.FlowPuzzleDb.put(puzzle);
	await deps.FlowPackDb.put(somePack);

	return deps;
};

describe(import.meta.file, () => {
	it("should send back listed puzzles", async () => {
		const client = generateAuthClient();
		const deps = await createDeps(client);
		const output = await AppServerModule.andThen(
			initial(),
			userObversedGrid(deps, client, []),
		);

		expect(
			didSendToClient(
				output,
				client.clientId,
				(msg) => msg.t === "listed-puzzles-by-id",
			),
		).toBe(true);
	});
});
