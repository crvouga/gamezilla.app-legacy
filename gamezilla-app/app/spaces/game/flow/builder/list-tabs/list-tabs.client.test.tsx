import {describe, expect, it} from 'bun:test';
import {didPlaySound} from 'gamezilla-app/app/@/client';
import {andThen} from 'gamezilla-app/app/spaces/@/architecture/game-client-v2';
import {EventId} from 'gamezilla-app/app/spaces/@/event';
import type {FlowClientCtx} from '../../@/flow-ctx';
import {initial, testFlowClientCtx} from '../@/testing/client';
import {BuilderClient} from '../builder.client';
import type {ModelClient} from '../builder.types';

import {BuilderCore} from '../builder.core';
import type {ListTab} from './list-tabs.types';
import {LamportTimestamp} from 'gamezilla-app/@/lamport-clock';

const userChangedListTab =
	(ctx: FlowClientCtx, listTab: ListTab) =>
	(model: ModelClient) => {
		return BuilderClient.update({
			ctx,
			model,
			modelCore: BuilderCore.initCore(
				{
					ctx,
				},
			),
			msgCore: {
				t: 'user-changed-list-tab',
				userId: ctx.currentUserId,
				eventId: EventId.generate(),
				listTab,
				happenedAt: LamportTimestamp.fromNumber(
					0,
				),
			},
		});
	};

describe(import.meta.file, () => {
	it('play a sound when changing list tabs', async () => {
		const ctx = await testFlowClientCtx();
		const output = andThen(
			initial,
			userChangedListTab(
				ctx,
				'packs',
			),
		);
		expect(didPlaySound(output)).toBe(true);
	});
});
