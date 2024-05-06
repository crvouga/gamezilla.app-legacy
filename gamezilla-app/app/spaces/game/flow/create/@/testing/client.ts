import { Ok } from "gamezilla-app/@/core";
import { LamportTimestamp } from "gamezilla-app/@/lamport-clock";
import { EventId } from "gamezilla-app/app/spaces/@/event";
import type { SpaceClientCtx } from "gamezilla-app/app/spaces/@/space";
import {
	SpaceGameFixtureClient,
	testSpaceClientCtx,
} from "../../../../@/testing/client";
import { Flow } from "../../../@/flow";
import type { FlowClientCtx } from "../../../@/flow-ctx";
import { FlowPack } from "../../../@/flow-pack/flow-pack";
import { FlowPuzzle } from "../../../@/flow-puzzle/flow-puzzle";
import type { FlowPuzzleId } from "../../../@/flow-puzzle/flow-puzzle-id";
import { samples } from "../../../@/flow/flow-variant/flow-grid/flow-grid-samples";
import { CreateClient } from "../../create.client";
import {
	initClient,
	type ModelClient,
	type ModelCore,
} from "../../create.types";
import { CreateCore } from "../../create.core";

export const FlowCreateFixtureClient = async () => {
	const f = await SpaceGameFixtureClient();
	const model = initClient;
	const modelCore = CreateCore.initCore({ ctx: f.ctx });
	const ctx: FlowClientCtx = {
		...f.ctx,
		onQuit() {},
	};
	return {
		...f,
		ctx,
		model,
		modelCore,
	};
};

export const initial = {
	model: initClient,
};

export const testFlowClientCtx = async (): Promise<FlowClientCtx> => {
	return {
		...(await testSpaceClientCtx()),
		onQuit() {},
	};
};

export const clickedPackCreateNewButton =
	(ctx: FlowClientCtx) => (model: ModelClient) => {
		return CreateClient.update({
			model,
			ctx: ctx,
			modelCore: CreateCore.initCore({ ctx }),
			msg: { t: "pack-create.clicked-create-button" },
		});
	};

export const userCreatedPack =
	(ctx: FlowClientCtx, pack: FlowPack) => (model: ModelClient) => {
		return CreateClient.update({
			model,
			ctx: ctx,
			modelCore: CreateCore.initCore({ ctx }),
			msgCore: {
				t: "user-created-pack",
				created: Ok(pack),
				eventId: EventId.generate(),
				happenedAt: LamportTimestamp.fromNumber(0),
				userId: ctx.currentUserId,
			},
		});
	};

export const clickedPackItem =
	(ctx: FlowClientCtx, pack: FlowPack) => (model: ModelClient) => {
		return CreateClient.update({
			model,
			ctx: ctx,
			modelCore: CreateCore.initCore({ ctx }),
			msg: { t: "pack-list.clicked-pack-item", pack },
		});
	};

export const clickedOpenPuzzlePickerButton =
	(ctx: FlowClientCtx, modelCore: ModelCore = CreateCore.initCore({ ctx })) =>
	(model: ModelClient) => {
		return CreateClient.update({
			model,
			msg: {
				t: "pack-builder.user-opened-add-puzzle-screen",
				userId: ctx.currentUserId,
			},
			ctx,
			modelCore,
		});
	};

export const closedPuzzlePickerDrawer =
	(ctx: FlowClientCtx) => (model: ModelClient) => {
		return CreateClient.update({
			model,
			msg: { t: "pack-builder.user-closed-add-puzzle-screen" },
			ctx,
			modelCore: CreateCore.initCore({ ctx }),
		});
	};

export const clickedPuzzleListItem =
	(ctx: FlowClientCtx, puzzle: FlowPuzzle) => (model: ModelClient) => {
		return CreateClient.update({
			model,
			msg: {
				t: "puzzle-list.clicked-puzzle-list-item",
				puzzle,
			},
			ctx,
			modelCore: CreateCore.initCore({ ctx }),
		});
	};

export const clickedExitPuzzleBuilderButton =
	(ctx: FlowClientCtx, modelCore: ModelCore = CreateCore.initCore({ ctx })) =>
	(model: ModelClient) => {
		return CreateClient.update({
			model,
			msg: { t: "puzzle-builder.user-clicked-exit-button" },
			ctx,
			modelCore: modelCore,
		});
	};

export const serverListedPuzzlesOk =
	(ctx: FlowClientCtx, puzzles: FlowPuzzle[]) => (model: ModelClient) => {
		return CreateClient.update({
			ctx: ctx,
			model,
			modelCore: CreateCore.initCore({ ctx }),
			msgServer: {
				t: "flow-puzzle-list",
				c: {
					t: "flow-puzzle-list.listed-puzzle",
					listed: Ok({
						items: puzzles,
						limit: 10,
						offset: 0,
						total: puzzles.length,
					}),
				},
			},
		});
	};

export const puzzleBuilderPressDownRandomNode =
	(ctx: FlowClientCtx, modelCore: ModelCore) => (model: ModelClient) => {
		const puzzleBuilder = modelCore.puzzleBuilder;

		if (!puzzleBuilder) {
			return { model };
		}

		const nodes = Object.values(Flow.toNodes(puzzleBuilder.puzzle.flow));

		const randomNode = nodes[Math.floor(Math.random() * nodes.length)];

		if (!randomNode) {
			return { model };
		}

		return CreateClient.update({
			model,
			msg: {
				t: "puzzle-builder.flow-ui-edit",
				c: { t: "pressed-down-node", nodeId: randomNode.nodeId },
			},
			ctx,
			modelCore: CreateCore.initCore({ ctx }),
		});
	};

export const puzzleBuilderUserSavedChanges =
	(ctx: FlowClientCtx, puzzle: FlowPuzzle) => (model: ModelClient) => {
		return CreateClient.update({
			model,
			msgCore: {
				t: "puzzle-builder.saved-puzzle",
				eventId: EventId.generate(),
				happenedAt: LamportTimestamp.fromNumber(0),
				saved: Ok(puzzle),
				userId: ctx.currentUserId,
			},
			ctx,
			modelCore: CreateCore.initCore({ ctx }),
		});
	};

export const clickedPuzzlePickerItem =
	(ctx: FlowClientCtx, puzzle: FlowPuzzle) => (model: ModelClient) => {
		return CreateClient.update({
			model,
			msg: {
				t: "pack-builder.user-clicked-add-puzzle-item",
				puzzle,
				userId: ctx.currentUserId,
			},
			ctx,
			modelCore: CreateCore.initCore({ ctx }),
		});
	};

export const clickedExitPuzzleButton =
	(ctx: FlowClientCtx) => (model: ModelClient) => {
		return CreateClient.update({
			model,
			msg: {
				t: "pack-builder.puzzle-screen.user-clicked-exit-puzzle-button",
				userId: ctx.currentUserId,
			},
			ctx,
			modelCore: CreateCore.initCore({ ctx }),
		});
	};

export const clickedPuzzleGridItem =
	(ctx: FlowClientCtx, puzzle: FlowPuzzle, puzzleIndex: number) =>
	(model: ModelClient) => {
		return CreateClient.update({
			model,
			msg: { t: "pack-builder.user-clicked-pack-item", puzzle, puzzleIndex },
			ctx,
			modelCore: CreateCore.initCore({ ctx }),
		});
	};

export const serverCreatedPack =
	(ctx: FlowClientCtx, pack: FlowPack) => (model: ModelClient) => {
		return CreateClient.update({
			model,
			ctx: ctx,
			modelCore: CreateCore.initCore({ ctx }),
			msgServer: {
				t: "pack-create.created-pack",
				created: Ok(pack),
			},
		});
	};

export function createFlowPuzzle(ctx: SpaceClientCtx) {
	return FlowPuzzle.create({
		count: 1,
		createdAt: ctx.now,
		createdBy: ctx.currentUserId,
		flow: samples["5x5"]["1"],
	});
}

export function createFlowPack(
	ctx: SpaceClientCtx,
	puzzleIds: FlowPuzzleId[] = [],
) {
	return FlowPack.create({
		now: ctx.now,
		puzzleIds,
		count: 1,
		createdBy: ctx.currentUserId,
	});
}
