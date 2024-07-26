import {
	APP_SOUND,
	playSound,
	pushRoute,
	showToast,
} from 'gamezilla-app/app/@/client';
import {SpaceId} from 'gamezilla-app/app/@/data';
import {Button, IconPlus} from 'gamezilla-app/app/@/ui';
import {withId} from '../@/event';
import {SpaceClientModule} from '../architecture/architecture';
import type {SpaceCoreEvent} from '../spaces-core';

const update: SpaceClientModule['update'] = (input) => {
	return SpaceClientModule.andThen(
		{model: input.model},
		//
		(model) =>
			updateFromSpaceEvent({
				...input,
				model,
			}),
		(model) =>
			updateStartSpaceButton({
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
		case 'user-started-space': {
			if (
				msgSpaceEvent.userId ===
				ctx.currentUserId
			) {
				return {
					model,
					msgCmd: [
						playSound(
							APP_SOUND.navForward,
						),
						pushRoute(
							{
								n: 'spaces',
								t: 'space',
								spaceId: msgSpaceEvent.spaceId,
							},
						),
						showToast(
							ctx.t(
								'spaces.space-started',
							),
						),
					],
				};
			}

			return {
				model,
			};
		}
		default: {
			return {
				model,
			};
		}
	}
};

//
//
//
//
//
//

const updateStartSpaceButton: SpaceClientModule['update'] = (input) => {
	const {ctx, msg, model} = input;

	switch (msg?.t) {
		case 'clicked-start-space-button': {
			if (!ctx.currentUserId) {
				return {
					model,
				};
			}

			const spaceEventNew =
				withId<SpaceCoreEvent>(
					{
						t: 'user-started-space',
						spaceId: msg.spaceId,
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

const ViewStartSpaceButton: SpaceClientModule['View'] = (input) => {
	return (
		<Button
			fab
			size="lg"
			color="primary"
			renderIconStart={(
				iconInput,
			) => (
				<IconPlus
					{...iconInput}
				/>
			)}
			onClick={() =>
				input.dispatch({
					t: 'clicked-start-space-button',
					spaceId: SpaceId.generate(),
				})
			}
			text={input.ctx.t(
				'spaces.start-space',
			)}
		/>
	);
};

export const StartSpaceClient = {
	ViewStartSpaceButton,
	update,
};
