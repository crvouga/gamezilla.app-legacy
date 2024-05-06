import { SpaceId, UserId } from "gamezilla-app/app/@/data";
import { pipe } from "gamezilla-app/@/core";
import { withId } from "../event";
import { Space } from "../../spaces-core";

export const makeSpace = ({
	spaceId,
	guestId = UserId.generate(),
	hostId,
}: { spaceId: SpaceId; hostId: UserId; guestId?: UserId }): Space.Model => {
	return pipe(
		Space.init,
		//
		(model) =>
			Space.appendEvent({
				model,
				event: withId({
					t: "user-started-space",
					spaceId: spaceId,
					userId: hostId,
				}),
			}),

		(model) =>
			Space.appendEvent({
				model,
				event: withId({
					t: "user-inputted-game",
					spaceId: spaceId,
					userId: hostId,
					game: "connect-four",
				}),
			}),

		(model) =>
			Space.appendEvent({
				model,
				event: withId({
					t: "user-joined-space",
					spaceId: spaceId,
					userId: guestId,
				}),
			}),
	);
};
