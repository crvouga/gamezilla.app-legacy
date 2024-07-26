import {FixtureSpaceClient} from 'gamezilla-app/app/spaces/@/testing/client';
import type {FlowClientCtx} from './flow-ctx';

export const FlowClientFixture = async () => {
	const f = await FixtureSpaceClient();
	const ctx: FlowClientCtx = {
		...f.ctx,
		flowPacks: {},
		flowPuzzles: {},
	};
	return {
		...f,
		ctx,
	};
};
