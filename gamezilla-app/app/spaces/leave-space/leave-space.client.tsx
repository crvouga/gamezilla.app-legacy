import {
	APP_SOUND,
	playSound,
	pushRoute,
	showToast,
} from "gamezilla-app/app/@shared/client";
import { Button } from "gamezilla-app/app/@shared/ui";
import { withId } from "../@shared/event";
import { SpaceClientModule } from "../architecture/architecture";
import { type SpaceEvent, Spaces } from "../spaces-core";

const update: SpaceClientModule["update"] = (input) => {
	return SpaceClientModule.andThen(
		{ model: input.model },
		(model) => updateFromSpaceEvent({ ...input, model }),
		(model) => updateLeaveSpaceButton({ ...input, model }),
	);
};

const updateFromSpaceEvent: SpaceClientModule["update"] = ({
	model,
	msgSpaceEvent,
	ctx,
}) => {
	switch (msgSpaceEvent?.t) {
		case "user-left-space": {
			if (!ctx.currentUserId) {
				return { model };
			}

			const currentUserSpaceId = Spaces.toSpaceIdByUserId(
				model,
				ctx.currentUserId,
			);

			if (msgSpaceEvent.spaceId !== currentUserSpaceId) {
				return { model };
			}

			if (msgSpaceEvent.userId !== ctx.currentUserId) {
				const username = ctx.profiles[msgSpaceEvent.userId]?.username;
				return {
					model,
					msgCmd: [
						playSound(APP_SOUND.navBackward),
						showToast(username ? `${username} left space` : "Left space"),
					],
				};
			}

			return {
				model,
				msgCmd: [
					playSound(APP_SOUND.navBackward),
					showToast("Left space"),
					pushRoute({
						n: "spaces",
						t: "space-list",
					}),
				],
			};
		}
		default: {
			return { model };
		}
	}
};

const updateLeaveSpaceButton: SpaceClientModule["update"] = ({
	ctx,
	model,
	msg,
}) => {
	switch (msg?.t) {
		case "clicked-leave-space-button": {
			if (!ctx.currentUserId) {
				return { model };
			}

			const currentUserSpaceId = Spaces.toSpaceIdByUserId(
				model,
				ctx.currentUserId,
			);

			if (!currentUserSpaceId) {
				return { model };
			}

			const spaceEventNew = withId<SpaceEvent>({
				t: "user-left-space",
				spaceId: currentUserSpaceId,
				userId: ctx.currentUserId,
			});

			return {
				model,
				msgSpaceEvent: [spaceEventNew],
			};
		}

		default: {
			return { model };
		}
	}
};

const ViewLeaveSpaceButton: SpaceClientModule["View"] = (props) => {
	return (
		<Button
			color="danger"
			variant="contained"
			size="sm"
			text="Leave"
			onClick={() => props.dispatch({ t: "clicked-leave-space-button" })}
		/>
	);
};

export const LeaveSpaceClient = {
	update,
	ViewLeaveSpaceButton,
};
