import {APP_SOUND, playSound} from 'gamezilla-app/app/@/client';
import {GameClientModule} from 'gamezilla-app/app/spaces/@/architecture/game-client-v2';
import {withId} from 'gamezilla-app/app/spaces/@/event';
import {FlowPuzzleListClient} from '../../@/flow-puzzle/flow-puzzle-list';
import type {ClientModule} from '../builder.types';
import {CreateNewPuzzleClient} from './create-new/create-new-puzzle.client';
import {Sub} from 'gamezilla-app/@/core';

const update: ClientModule['update'] = (input) => {
	return GameClientModule.andThen(
		{model: input.model},
		(model) =>
			CreateNewPuzzleClient.update({
				...input,
				model,
			}),
		(model) =>
			updateOpenPuzzle({
				...input,
				model,
			}),
	);
};

const updateOpenPuzzle: ClientModule['update'] = (input) => {
	const {model, msgCore, msg} = input;

	switch (msg?.t) {
		case 'builder-open-puzzle.clicked-puzzle-list-item': {
			return {
				model,
				msgCore: [
					withId(
						{
							t: 'builder-open-puzzle.clicked-puzzle-list-item',
							puzzle: msg.puzzle,
						},
					),
				],
			};
		}
	}

	switch (msgCore?.t) {
		case 'builder-open-puzzle.clicked-puzzle-list-item': {
			return {
				model,
				msgCmd: [
					playSound(
						APP_SOUND.navForwardMin,
					),
				],
			};
		}
	}

	return {model};
};

const View: ClientModule['View'] = (input) => {
	const {model, dispatch} = input;

	return (
		<FlowPuzzleListClient.View
			ctx={input.ctx}
			dispatch={(c) =>
				input.dispatch({
					t: 'flow-puzzle-list',
					c,
				})
			}
			model={model.flowPuzzleList}
			emits={{
				clickedPuzzleItem: (
					puzzle,
				) =>
					dispatch(
						{
							t: 'builder-open-puzzle.clicked-puzzle-list-item',
							puzzle,
						},
					),
			}}
			slots={{
				fab: () => (
					<CreateNewPuzzleClient.ViewCreateFab
						{...input}
					/>
				),
			}}
		/>
	);
};

const subscriptions: ClientModule['subscriptions'] = (input) => {
	return Sub.batch([CreateNewPuzzleClient.subscriptions(input)]);
};

export const ScreenOpenPuzzleClient = {
	update,
	View,
	subscriptions,
};
