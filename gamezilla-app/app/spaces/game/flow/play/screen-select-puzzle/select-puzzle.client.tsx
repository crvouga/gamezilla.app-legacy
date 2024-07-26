import {APP_SOUND, playSound} from 'gamezilla-app/app/@/client';
import {TopBar} from 'gamezilla-app/app/@/ui';
import {withId} from 'gamezilla-app/app/spaces/@/event';
import {FlowPackPuzzlesGridUI} from '../../@/flow-pack/flow-pack-puzzles-grid/flow-pack-puzzles-grid-ui';
import {FlowPackPuzzlesGridClient} from '../../@/flow-pack/flow-pack-puzzles-grid/flow-pack-puzzles-grid.client';
import type {ClientModule} from '../play.types';

const update: ClientModule['update'] = (input) => {
	switch (input.msg?.t) {
		case 'user-clicked-exit-pack-button':
		case 'user-clicked-open-puzzle-grid-item': {
			return {
				model: input.model,
				msgCore: [
					withId(
						input.msg,
					),
				],
			};
		}
	}

	switch (input.msgCore?.t) {
		case 'user-clicked-exit-pack-button': {
			return {
				model: input.model,
				msgCmd: [
					playSound(
						APP_SOUND.navBackwardMin,
					),
				],
			};
		}
		case 'user-clicked-open-puzzle-grid-item': {
			return {
				model: input.model,
				msgCmd: [
					playSound(
						APP_SOUND.navForwardMin,
					),
				],
			};
		}
	}

	return {
		model: input.model,
	};
};

const View: ClientModule['View'] = (input) => {
	if (input.modelCore.screen.t !== 'screen-select-puzzle') {
		return null;
	}
	return (
		<>
			<FlowPackPuzzlesGridClient.ViewObserver
				dispatch={(c) =>
					input.dispatch(
						{
							t: 'flow-pack-grid',
							c,
						},
					)
				}
			/>
			<div className="flex h-full w-full flex-1 flex-col">
				<TopBar
					ctx={
						input.ctx
					}
					onBack={() =>
						input.dispatch(
							{
								t: 'user-clicked-exit-pack-button',
							},
						)
					}
					title={input.ctx.t(
						'flow-pack-name',
						input
							.modelCore
							.screen
							.flowPack
							.name,
					)}
				/>
				<div className="flex flex-1 flex-col items-center justify-center">
					<FlowPackPuzzlesGridUI.ViewPackPuzzleGrid
						id="pack-puzzle-grid"
						onSlideIndexChanged={() => {}}
						puzzleIds={
							input
								.modelCore
								.screen
								.flowPack
								.puzzleIds
						}
						renderCell={(
							inputCell,
						) => {
							if (
								!inputCell.puzzleId
							) {
								return (
									<FlowPackPuzzlesGridUI.ViewEmptyCell />
								);
							}
							const puzzle =
								input
									.model
									.flowPuzzles[
									inputCell
										.puzzleId
								];
							if (
								!puzzle
							) {
								return (
									<FlowPackPuzzlesGridUI.ViewLoadingCell />
								);
							}
							return (
								<FlowPackPuzzlesGridUI.ViewPuzzleCell
									index={
										inputCell.index
									}
									onClick={() =>
										input.dispatch(
											{
												t: 'user-clicked-open-puzzle-grid-item',
												flowPuzzle: puzzle,
												puzzleIndex: inputCell.index,
											},
										)
									}
								/>
							);
						}}
						slideIndex={
							0
						}
					/>
				</div>
			</div>
		</>
	);
};

export const ScreenSelectPuzzleClient = {
	update,
	View,
};
