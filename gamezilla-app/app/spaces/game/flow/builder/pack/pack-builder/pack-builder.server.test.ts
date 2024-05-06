import { describe, expect, it } from "bun:test";
import { Result } from "gamezilla-app/@/core";
import { withId } from "gamezilla-app/app/spaces/@/event";
import { randomFlowPack, randomFlowPuzzle } from "../../../@/testing";
import { FlowCreateFixtureServer } from "../../@/testing/server";
import { ModelCore, MsgCore } from "../../builder.types";
import { PackBuilderCore } from "./pack-builder.core";
import { PackBuilderServer } from "./pack-builder.server";

const Fixture = async () => {
	const f = await FlowCreateFixtureServer();
	const puzzle = await randomFlowPuzzle();
	const pack = await randomFlowPack({
		createdBy: puzzle.createdBy,
		puzzleIds: [puzzle.id],
	});
	await f.deps.FlowPackDb.put(pack);
	await f.deps.FlowPuzzleDb.put(puzzle);
	const modelCore: ModelCore = {
		...f.modelCore,
		packBuilder: PackBuilderCore.init({
			pack,
		}),
	};
	return {
		...f,
		pack,
		modelCore,
	};
};

describe(import.meta.file, () => {
	it("should save pack after user adds a new puzzle", async () => {
		const f = await Fixture();

		const puzzle = await randomFlowPuzzle();

		const msgCore = withId<MsgCore>({
			t: "pack-builder.user-clicked-add-puzzle-item",
			puzzle: puzzle,
			userId: puzzle.createdBy,
		});

		const modelCoreNew = PackBuilderCore.update({
			ctx: f.ctx,
			modelCore: f.modelCore,
			msgCore,
		});

		const updated = await PackBuilderServer.update({
			...f,
			modelCore: modelCoreNew,
			msgCore,
		});

		expect(
			updated.msgCore?.some(
				(msgCore) =>
					msgCore.t === "pack-builder.saved-pack" && msgCore.saved.t === "ok",
			),
		).toBe(true);
	});

	it("should save pack after user removes puzzle from it", async () => {
		const f = await Fixture();

		await PackBuilderServer.update({
			...f,
			msgCore: withId({
				t: "remove-puzzle-from-pack.user-clicked-remove-from-pack-button",
				puzzleIndex: 0,
				userId: f.pack.createdBy,
			}),
		});

		const before = f.pack;
		const after = Result.withDefault(
			await f.deps.FlowPackDb.get(f.pack.id),
			null,
		);

		expect(before.puzzleIds.includes(f.pack.puzzleIds[0]!)).toBe(true);
		expect(after?.puzzleIds.includes(f.pack.puzzleIds[0]!)).toBe(false);
	});
});
