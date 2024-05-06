import { describe, expect, it } from "bun:test";
import { withId } from "gamezilla-app/app/spaces/@/event";
import { randomFlowPack, randomFlowPuzzle } from "../../../@/testing";
import { FlowCreateFixtureServer } from "../../@/testing/server";
import { ModelCore, MsgCore } from "../../create.types";
import { PackBuilderServer } from "./pack-builder.server";
import { PackBuilderCore } from "./pack-builder.core";

const Fixture = async () => {
	const f = await FlowCreateFixtureServer();
	const pack = await randomFlowPack();
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
});
