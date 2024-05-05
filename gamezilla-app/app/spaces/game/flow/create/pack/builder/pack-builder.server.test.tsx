import { describe, expect, it } from "bun:test";
import { withId } from "gamezilla-app/app/spaces/@/event";
import { randomFlowPack, randomFlowPuzzle } from "../../../@/testing";
import { FlowCreateFixtureServer } from "../../@/testing/server";
import { ModelSync, MsgSync } from "../../create.core";
import { PackBuilderServer } from "./pack-builder.server";
import { PackBuilderSync } from "./pack-builder.sync";

const Fixture = async () => {
	const f = await FlowCreateFixtureServer();
	const pack = await randomFlowPack();
	const modelSync: ModelSync = {
		...f.modelSync,
		packBuilder: {
			t: "pack-builder",
			pack: pack,
			screen: { t: "add-puzzle" },
		},
	};
	return {
		...f,
		pack,
		modelSync,
	};
};

describe(import.meta.file, () => {
	it("should save pack after user adds a new puzzle", async () => {
		const f = await Fixture();

		const puzzle = await randomFlowPuzzle();

		const msgSync = withId<MsgSync>({
			t: "pack-builder.user-clicked-add-puzzle-item",
			puzzle: puzzle,
			userId: puzzle.createdBy,
		});

		const modelSyncNew = PackBuilderSync.reducer({
			ctx: f.ctx,
			modelSync: f.modelSync,
			msgSync,
		});

		const updated = await PackBuilderServer.update({
			...f,
			modelSync: modelSyncNew,
			msgSync,
		});

		expect(
			updated.msgSync?.some(
				(msgSync) =>
					msgSync.t === "pack-builder.saved-pack" && msgSync.saved.t === "ok",
			),
		).toBe(true);
	});
});
