import { describe, expect, it } from "bun:test";
import { NonEmpty } from "gamezilla-app/@/core";
import { SpaceCoreFixture } from "gamezilla-app/app/spaces/@/testing/core";
import { FlowPack } from "../@/flow-pack";
import { PlayCore } from "./play.core";
import { ModelCore, MsgCore } from "./play.types";

const Fixture = async () => {
	const f = await SpaceCoreFixture();

	const updates = (
		modelCore: ModelCore,
		msgs: MsgCore[],
	): NonEmpty<ModelCore> => {
		const [msgCore, ...rest] = msgs;

		if (!msgCore) {
			return [modelCore];
		}

		const updated = PlayCore.updateCore({ ctx: f.ctx, modelCore, msgCore });

		return updates(updated, rest);
	};

	const update = (modelCore: ModelCore, msgCore: MsgCore[]): ModelCore => {
		return updates(modelCore, msgCore)[0];
	};

	const init = PlayCore.initCore({
		ctx: f.ctx,
	});

	return {
		init,
		f,
		updates,
		update,
	};
};

describe(import.meta.file, () => {
	it("should be able to open pack from list", async () => {
		const f = await Fixture();
		const updated = f.update(f.init, [
			{
				t: "user-clicked-pack-list-item",
				pack: await FlowPack.random(),
			},
		]);
		expect(updated.screen.t).toEqual("pack");
	});
});
