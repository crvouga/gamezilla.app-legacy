import {
	APP_SOUND,
	playSound,
	pushRoute,
	showToast,
} from "gamezilla-app/app/@/client";
import { Button } from "gamezilla-app/app/@/ui";
import { withId } from "../@/event";
import { SpaceClientModule } from "../architecture/architecture";
import { type SpaceEvent, Spaces } from "../spaces-core";

const update: SpaceClientModule["update"] = (input) => {
	return SpaceClientModule.andThen(
		{ model: input.model },
		(model) => updateEndSpaceButton({ ...input, model }),
		(model) => updateFromSpaceEvent({ ...input, model }),
		(model) => updateFromAppEvent({ ...input, model }),
	);
};

const updateFromAppEvent: SpaceClientModule["update"] = (input) => {
	const { ctx, model, msgEvt } = input;

	switch (msgEvt?.t) {
		case "auth/unauthenticated": {
			const { currentUserId } = ctx;
			const currentUserSpaceId = Spaces.toSpaceIdByUserId(model, currentUserId);
			if (!currentUserId || !currentUserSpaceId) {
				return { model };
			}

			return {
				model,
				msgSpaceEvent: [
					withId({
						t: "user-ended-space",
						spaceId: currentUserSpaceId,
						userId: currentUserId,
					}),
				],
			};
		}

		default: {
			return { model };
		}
	}
};

const updateFromSpaceEvent: SpaceClientModule["update"] = (input) => {
	const { ctx, model, msgSpaceEvent } = input;

	switch (msgSpaceEvent?.t) {
		case "user-ended-space": {
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

			return SpaceClientModule.andThen(
				{ model },
				(model) => {
					return {
						model,
						msgCmd: [playSound(APP_SOUND.navBackward)],
					};
				},
				(model) => {
					if (
						ctx.currentRoute.t === "space" &&
						ctx.currentRoute.spaceId === msgSpaceEvent.spaceId
					) {
						return {
							model,
							msgCmd: [
								pushRoute({
									n: "spaces",
									t: "space-list",
								}),
							],
						};
					}
					return {
						model,
						msgCmd: [],
					};
				},
				(model) => {
					if (msgSpaceEvent.userId === ctx.currentUserId) {
						return {
							model,
							msgCmd: [showToast("Space ended")],
						};
					}

					const profile = ctx.profiles[msgSpaceEvent.userId];

					if (!profile) {
						return {
							model,
							msgCmd: [showToast("Space ended by host")],
						};
					}

					return {
						model,
						msgCmd: [showToast(`Space ended by ${profile.username}`)],
					};
				},
			);
		}

		default: {
			return { model };
		}
	}
};

const updateEndSpaceButton: SpaceClientModule["update"] = ({
	msg,
	model,
	ctx,
}) => {
	switch (msg?.t) {
		case "clicked-end-space-button": {
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
				t: "user-ended-space",
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

export const ViewEndSpaceButton: SpaceClientModule["View"] = (props) => {
	return (
		<Button
			color="danger"
			variant="contained"
			size="sm"
			text="End"
			onClick={() => props.dispatch({ t: "clicked-end-space-button" })}
		/>
	);
};

const ViewSpaceEnded: SpaceClientModule["View"] = (props) => {
	return (
		<div className="flex flex-1 flex-col items-center justify-center gap-4">
			<p className="text-center text-2xl">Space ended</p>
			<Button
				onClick={() => props.dispatch({ t: "clicked-go-home-button" })}
				size="lg"
				variant="contained"
				color="primary"
				text="Go Home"
			/>
		</div>
	);
};

export const EndSpaceClient = {
	ViewSpaceEnded,
	ViewEndSpaceButton,
	update,
};
