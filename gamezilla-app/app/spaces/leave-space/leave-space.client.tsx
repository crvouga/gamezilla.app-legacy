import {
	APP_SOUND,
	playSound,
	pushRoute,
	showToast,
} from 'gamezilla-app/app/@/client';
import {Button} from 'gamezilla-app/app/@/ui';
import {withId} from '../@/event';
import {SpaceClientModule} from '../architecture/architecture';
import type {SpaceCoreEvent} from '../spaces-core';
import * as SpacesCoreClient from '../spaces-core/spaces-core.client';

const update: SpaceClientModule['update'] = (input) => {
	return SpaceClientModule.andThen(
		{model: input.model},
		(model) =>
			updateFromSpaceEvent({
				...input,
				model,
			}),
		(model) =>
			updateLeaveSpaceButton({
				...input,
				model,
			}),
	);
};

const updateFromSpaceEvent: SpaceClientModule['update'] = ({
	model,
	msgSpaceEvent,
	ctx,
}) => {
	switch (msgSpaceEvent?.t) {
		case 'user-left-space': {
			if (!ctx.currentUserId) {
				return {
					model,
				};
			}

			const currentUserSpaceId =
				SpacesCoreClient.toSpaceIdByUserId(
					model,
					ctx.currentUserId,
				);

			if (
				msgSpaceEvent.spaceId !==
				currentUserSpaceId
			) {
				return {
					model,
				};
			}

			if (
				msgSpaceEvent.userId !==
				ctx.currentUserId
			) {
				const username =
					ctx
						.profiles[
						msgSpaceEvent
							.userId
					]
						?.username;
				return {
					model,
					msgCmd: [
						playSound(
							APP_SOUND.navBackward,
						),
						username
							? showToast(
									ctx.t(
										'spaces.other-user-left',
										username,
									),
							  )
							: showToast(
									ctx.t(
										'spaces.current-user-left',
									),
							  ),
					],
				};
			}

			return {
				model,
				msgCmd: [
					playSound(
						APP_SOUND.navBackward,
					),
					showToast(
						ctx.t(
							'spaces.current-user-left',
						),
					),
					pushRoute(
						{
							n: 'spaces',
							t: 'space-list',
						},
					),
				],
			};
		}
		default: {
			return {
				model,
			};
		}
	}
};

const updateLeaveSpaceButton: SpaceClientModule['update'] = ({
	ctx,
	model,
	msg,
}) => {
	switch (msg?.t) {
		case 'clicked-leave-space-button': {
			if (!ctx.currentUserId) {
				return {
					model,
				};
			}

			const currentUserSpaceId =
				SpacesCoreClient.toSpaceIdByUserId(
					model,
					ctx.currentUserId,
				);

			if (!currentUserSpaceId) {
				return {
					model,
				};
			}

			const spaceEventNew =
				withId<SpaceCoreEvent>(
					{
						t: 'user-left-space',
						spaceId: currentUserSpaceId,
						userId: ctx.currentUserId,
					},
				);

			return {
				model,
				msgSpaceEvent: [
					spaceEventNew,
				],
			};
		}

		default: {
			return {
				model,
			};
		}
	}
};

const ViewLeaveSpaceButton: SpaceClientModule['View'] = (input) => {
	return (
		<Button
			color="danger"
			variant="contained"
			size="sm"
			text={input.ctx.t(
				'spaces.leave',
			)}
			onClick={() =>
				input.dispatch({
					t: 'clicked-leave-space-button',
				})
			}
		/>
	);
};

export const LeaveSpaceClient = {
	update,
	ViewLeaveSpaceButton,
};
