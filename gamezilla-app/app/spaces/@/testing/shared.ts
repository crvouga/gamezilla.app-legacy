import {type SpaceId, UserId} from 'gamezilla-app/app/@/data';
import {pipe} from 'gamezilla-app/@/core';
import {withId} from '../event';
import {SpaceCore} from '../../spaces-core';

export const makeSpace = ({
	spaceId,
	guestId = UserId.generate(),
	hostId,
}: {
	spaceId: SpaceId;
	hostId: UserId;
	guestId?: UserId;
}): SpaceCore.Model => {
	return pipe(
		SpaceCore.init,
		//
		(model) =>
			SpaceCore.appendEvent({
				model,
				event: withId({
					t: 'user-started-space',
					spaceId: spaceId,
					userId: hostId,
				}),
			}),

		(model) =>
			SpaceCore.appendEvent({
				model,
				event: withId({
					t: 'user-inputted-game',
					spaceId: spaceId,
					userId: hostId,
					game: 'connect-four',
				}),
			}),

		(model) =>
			SpaceCore.appendEvent({
				model,
				event: withId({
					t: 'user-joined-space',
					spaceId: spaceId,
					userId: guestId,
				}),
			}),
	);
};
