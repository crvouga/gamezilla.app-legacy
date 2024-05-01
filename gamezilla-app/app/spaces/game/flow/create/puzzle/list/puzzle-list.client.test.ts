import { describe, expect, it } from "bun:test";
import { LamportTimestamp } from "gamezilla-app/@/lamport-clock";
import { didPlaySound } from "gamezilla-app/app/@/client";
import { andThen } from "gamezilla-app/app/spaces/@/architecture/game-client-v2";
import { EventId } from "gamezilla-app/app/spaces/@/event";
import type { FlowClientCtx } from "../../../@/flow-ctx";
import type { FlowPuzzle } from "../../../@/flow-puzzle/flow-puzzle";
import {
	createFlowPuzzle,
	initial,
	testFlowClientCtx,
} from "../../@/testing/client";
import { deriveModelSync } from "../../@/testing/game";
import { CreateClient } from "../../create.client";
import type { ModelClient } from "../../create.core";
import { initSync } from "../../create.sync";

const clickedPuzzleListItem =
	(ctx: FlowClientCtx, puzzle: FlowPuzzle) => (model: ModelClient) => {
		return CreateClient.update({
			ctx,
			model,
			modelSync: initSync({ ctx }),
			msg: {
				t: "puzzle-list.clicked-puzzle-list-item",
				puzzle,
			},
		});
	};

const userClickedPuzzleListItem =
	(ctx: FlowClientCtx, puzzle: FlowPuzzle) => (model: ModelClient) => {
		return CreateClient.update({
			ctx,
			model,
			modelSync: initSync({ ctx }),
			msgSync: {
				t: "puzzle-list.clicked-puzzle-list-item",
				puzzle,
				eventId: EventId.generate(),
				happenedAt: LamportTimestamp.fromNumber(0),
			},
		});
	};

describe(import.meta.file, () => {
	it("should open puzzle builder after clicking a puzzle in the list", async () => {
		const ctx = await testFlowClientCtx();

		const puzzle = await createFlowPuzzle(ctx);

		const output = andThen(
			initial,
			clickedPuzzleListItem(ctx, puzzle),
			//
		);

		const modelSync = deriveModelSync(ctx)(output);

		expect(
			modelSync.opened.t === "puzzle-builder" &&
				modelSync.puzzleBuilder?.puzzle.id === puzzle.id,
		).toBe(true);
	});

	it("should play a sound when clicking a puzzle in the list", async () => {
		const ctx = await testFlowClientCtx();

		const puzzle = await createFlowPuzzle(ctx);

		const output = andThen(
			initial,
			userClickedPuzzleListItem(ctx, puzzle),
			//
		);

		expect(didPlaySound(output)).toBe(true);
	});
});
