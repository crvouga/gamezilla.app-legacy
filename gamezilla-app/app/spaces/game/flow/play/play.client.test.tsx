import { describe, it } from "bun:test";
import { expectByText } from "gamezilla-app/@/vdom/vdom-testing";
import { SpaceClientFixture } from "gamezilla-app/app/spaces/@/testing/client";
import { FlowClientCtx } from "../@/flow-ctx";
import { PlayClient } from "./play.client";
import { ModelClient, initCore } from "./play.types";

const Fixture = async () => {
	const f = await SpaceClientFixture();
	const ctx: FlowClientCtx = {
		...f.ctx,
		onQuit() {},
		flowPacks: {},
		flowPuzzles: {},
	};
	const initialCore = initCore({ ctx });
	const render = (model: ModelClient = PlayClient.init) => {
		const vdom = (
			<PlayClient.View
				ctx={ctx}
				dispatch={() => {}}
				model={model}
				modelCore={initialCore}
			/>
		);
		const dom = f.render(vdom);
		return dom;
	};
	return {
		...f,
		initial: PlayClient.init,
		initialCore,
		ctx,
		render,
	};
};

describe(import.meta.file, () => {
	it("should render exit button", async () => {
		const f = await Fixture();
		expectByText(f.render(f.initial), f.ctx.t("app.exit"));
	});
	it('should say "play"', async () => {
		const f = await Fixture();
		expectByText(f.render(f.initial), f.ctx.t("flow.play"));
	});
});
