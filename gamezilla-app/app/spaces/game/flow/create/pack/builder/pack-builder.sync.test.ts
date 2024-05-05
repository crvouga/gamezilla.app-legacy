import { describe, expect, it } from "bun:test";
import { SpaceGameSyncFixture } from "gamezilla-app/app/spaces/game/@/testing/sync";
import { randomFlowPack, randomFlowPuzzle } from "../../../@/testing";
import { CreateSync } from "../../create.sync";
import { PackBuilderSync } from "./pack-builder.sync";
import { ModelSync } from "../../create.core";
import { MsgSync } from "./pack-builder.core";
import { UserId } from "gamezilla-app/app/@/data";

const Fixture = async () => {
	const f = await SpaceGameSyncFixture();
	const currentUserId = UserId.generate();
	const puzzle = await randomFlowPuzzle({
		createdBy: currentUserId,
	});
	const pack = await randomFlowPack({
		createdBy: puzzle.createdBy,
		puzzleIds: [puzzle.id],
	});
	const init = CreateSync.initSync({ ctx: f.ctx });
	const modelSync: ModelSync = {
		...init,
		packBuilder: {
			t: "pack-builder",
			pack,
			screen: {
				t: "screen-puzzle-grid",
				pageIndex: 0,
			},
		},
	};
	return {
		...f,
		currentUserId,
		pack,
		puzzle,
		modelSync,
	};
};

describe(import.meta.file, () => {
	it("should remove puzzle from pack after clicking remove button", async () => {
		const f = await Fixture();

		const msgs: MsgSync[] = [
			{
				t: "pack-builder.user-clicked-pack-item",
				index: 0,
				puzzle: f.puzzle,
			},
			{
				t: "pack-builder.puzzle-screen.user-clicked-remove-from-pack-button",
				userId: f.currentUserId,
				puzzleIndex: f.pack.puzzleIds.indexOf(f.puzzle.id),
			},
		];

		const reduced = msgs.reduce(
			(modelSync, msgSync) =>
				PackBuilderSync.reducer({ ctx: f.ctx, modelSync, msgSync }),
			f.modelSync,
		);

		expect(reduced.packBuilder?.pack.puzzleIds.includes(f.puzzle.id)).toBe(
			false,
		);
	});
});
