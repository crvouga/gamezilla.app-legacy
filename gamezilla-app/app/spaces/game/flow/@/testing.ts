import { SpaceClientFixture } from "gamezilla-app/app/spaces/@/testing/client";
import type { FlowClientCtx } from "./flow-ctx";

export const FlowClientFixture = async () => {
	const f = await SpaceClientFixture();
	const ctx: FlowClientCtx = {
		...f.ctx,
		onQuit() {},
		flowPacks: {},
		flowPuzzles: {},
	};
	return {
		...f,
		ctx,
	};
};
