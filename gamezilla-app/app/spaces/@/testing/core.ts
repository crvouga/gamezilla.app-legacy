import {SpaceId, UserId} from 'gamezilla-app/app/@/data';
import {makeSpace} from './shared';
import type {SpaceCtx} from '../space';
import {SpaceCore} from '../../spaces-core';

export const SpaceCoreFixture = async () => {
	const spaceId = SpaceId.generate();
	const hostId = UserId.generate();
	const guestId = UserId.generate();
	const spaceState = SpaceCore.toSpaceStarted(
		makeSpace({
			spaceId,
			hostId,
			guestId,
		}),
	);
	if (!spaceState) {
		throw new Error(
			'SpaceCoreFixture: spaceState is null',
		);
	}
	const ctx: SpaceCtx = {
		space: spaceState,
	};
	return {
		ctx,
		spaceId,
		hostId,
		guestId,
		space: spaceState,
	};
};
