import {
	APP_SOUND,
	playSound,
	pushRoute,
	showToast,
} from "gamezilla-app/app/@/client";
import { Button, Typography } from "gamezilla-app/app/@/ui";
import { withId } from "../@/event";
import { SpaceClientModule } from "../architecture/architecture";
import type { SpaceCoreEvent } from "../spaces-core";
import * as SpacesCoreClient from "../spaces-core/spaces-core.client";

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
			const currentUserSpaceId = SpacesCoreClient.toSpaceIdByUserId(
				model,
				currentUserId,
			);
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

			const currentUserSpaceId = SpacesCoreClient.toSpaceIdByUserId(
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
							msgCmd: [
								showToast(input.ctx.t("spaces.ended-space-current-user")),
							],
						};
					}

					const profile = ctx.profiles[msgSpaceEvent.userId];

					if (!profile) {
						return {
							model,
							msgCmd: [showToast(input.ctx.t("spaces.ended-space-host"))],
						};
					}

					return {
						model,
						msgCmd: [
							showToast(
								input.ctx.t("spaces.ended-space-other-user", profile.username),
							),
						],
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

			const currentUserSpaceId = SpacesCoreClient.toSpaceIdByUserId(
				model,
				ctx.currentUserId,
			);

			if (!currentUserSpaceId) {
				return { model };
			}

			const spaceEventNew = withId<SpaceCoreEvent>({
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

export const ViewEndSpaceButton: SpaceClientModule["View"] = (input) => {
	return (
		<Button
			color="danger"
			variant="contained"
			size="sm"
			text={input.ctx.t("spaces.end")}
			onClick={() => input.dispatch({ t: "clicked-end-space-button" })}
		/>
	);
};

const ViewSpaceEnded: SpaceClientModule["View"] = (input) => {
	return (
		<div className="flex flex-1 flex-col items-center justify-center gap-4">
			<Typography text={input.ctx.t("spaces.space-ended")} variant="title" />
			<Button
				onClick={() => input.dispatch({ t: "clicked-go-home-button" })}
				size="lg"
				variant="contained"
				color="primary"
				text={input.ctx.t("spaces.go-home")}
			/>
		</div>
	);
};

export const EndSpaceClient = {
	ViewSpaceEnded,
	ViewEndSpaceButton,
	update,
};
