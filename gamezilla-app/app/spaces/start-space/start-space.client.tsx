import {
	APP_SOUND,
	playSound,
	pushRoute,
	showToast,
} from "gamezilla-app/app/@/client";
import { SpaceId } from "gamezilla-app/app/@/data";
import { Button } from "gamezilla-app/app/@/ui";
import { withId } from "../@/event";
import { SpaceClientModule } from "../architecture/architecture";
import type { SpaceEvent } from "../spaces-core";

const update: SpaceClientModule["update"] = (input) => {
	return SpaceClientModule.andThen(
		{ model: input.model },
		//
		(model) => updateFromSpaceEvent({ ...input, model }),
		(model) => updateStartSpaceButton({ ...input, model }),
	);
};

const updateFromSpaceEvent: SpaceClientModule["update"] = ({
	model,
	msgSpaceEvent,
	ctx,
}) => {
	switch (msgSpaceEvent?.t) {
		case "user-started-space": {
			if (msgSpaceEvent.userId === ctx.currentUserId) {
				return {
					model,
					msgCmd: [
						playSound(APP_SOUND.navForward),
						pushRoute({
							n: "spaces",
							t: "space",
							spaceId: msgSpaceEvent.spaceId,
						}),
						showToast("Started space"),
					],
				};
			}

			return { model };
		}
		default: {
			return { model };
		}
	}
};

//
//
//
//
//
//

const updateStartSpaceButton: SpaceClientModule["update"] = (input) => {
	const { ctx, msg, model } = input;

	switch (msg?.t) {
		case "clicked-start-space-button": {
			if (!ctx.currentUserId) {
				return { model };
			}

			const spaceEventNew = withId<SpaceEvent>({
				t: "user-started-space",
				spaceId: msg.spaceId,
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

const ViewStartSpaceButton: SpaceClientModule["View"] = (props) => {
	return (
		<Button
			size="lg"
			color="primary"
			className="w-full"
			onClick={() =>
				props.dispatch({
					t: "clicked-start-space-button",
					spaceId: SpaceId.generate(),
				})
			}
			text="Start new space"
		/>
	);
};

export const StartSpaceClient = {
	ViewStartSpaceButton,
	update,
};
