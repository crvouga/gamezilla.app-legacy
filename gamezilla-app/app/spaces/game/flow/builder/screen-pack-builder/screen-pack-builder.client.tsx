import {Eff, Sub} from 'gamezilla-app/@/core';
import {APP_SOUND, playSound, showToast} from 'gamezilla-app/app/@/client';
import {
	Button,
	Drawer,
	IconArrowLeftOnRect,
	IconChevronLeft,
	IconChevronRight,
	IconDeleteForever,
	IconEllipsisVertical,
	ListItemButton,
	TopBar,
} from 'gamezilla-app/app/@/ui';
import {GameClientModule} from 'gamezilla-app/app/spaces/@/architecture/game-client-v2';
import {withId} from 'gamezilla-app/app/spaces/@/event';
import {SpaceClientCmd} from 'gamezilla-app/app/spaces/@/space-client-cmd';
import {ViewBottomButtonBar, ViewBottomButtonBarAction} from '../../../@/game';
import {FlowPackPuzzlesGridUI} from '../../@/flow-pack/flow-pack-puzzles-grid/flow-pack-puzzles-grid-ui';
import {FlowPackPuzzlesGridClient} from '../../@/flow-pack/flow-pack-puzzles-grid/flow-pack-puzzles-grid.client';
import {FlowPuzzleListClient} from '../../@/flow-puzzle/flow-puzzle-list';
import {FlowPlay} from '../../@/flow/flow-play';
import type {ClientModule} from '../builder.types';
import {EditPackNameClient} from './edit-pack-name/edit-pack-name.client';
import {ScreenPackBuilderCore} from './screen-pack-builder.core';

//
//
//
//
//
//

const ButtonExitBuilder: Pick<ClientModule, 'update' | 'View'> = {
	update(input) {
		const {model, msg, msgCore} = input;

		switch (msg?.t) {
			case 'pack-builder.user-clicked-exit-button': {
				return {
					model,
					msgCore: [
						withId(
							msg,
						),
					],
				};
			}
		}

		switch (msgCore?.t) {
			case 'pack-builder.user-clicked-exit-button': {
				return {
					model,
					msgCmd: [
						playSound(
							APP_SOUND.navBackwardMin,
						),
					],
				};
			}
		}

		return {model};
	},

	View(input) {
		return (
			<Button
				renderIconStart={(
					inputIcons,
				) => (
					<IconArrowLeftOnRect
						{...inputIcons}
					/>
				)}
				className="w-full"
				text={input.ctx.t(
					'app.exit',
				)}
				onClick={() =>
					input.dispatch(
						{
							t: 'pack-builder.user-clicked-exit-button',
							userId: input
								.ctx
								.currentUserId,
						},
					)
				}
			/>
		);
	},
};

//
//
//
//
//
//
//
//

const ButtonAddPuzzle: Pick<ClientModule, 'update' | 'View'> = {
	update(input) {
		const {model, msg} = input;

		switch (msg?.t) {
			case 'pack-builder.user-opened-add-puzzle-screen': {
				return {
					model,
					msgCore: [
						withId(
							msg,
						),
					],
					msgCmd: [
						playSound(
							APP_SOUND.navForwardMin,
						),
					],
				};
			}
		}
		return {model};
	},

	View(input) {
		return (
			<FlowPackPuzzlesGridUI.ViewAddCell
				onClick={() =>
					input.dispatch(
						{
							t: 'pack-builder.user-opened-add-puzzle-screen',
							userId: input
								.ctx
								.currentUserId,
						},
					)
				}
			/>
		);
	},
};

//
//
//
//
//
//

const ScreenAddPuzzle: Pick<ClientModule, 'update' | 'View'> = {
	update(input) {
		const {model, msg} = input;

		switch (msg?.t) {
			case 'pack-builder.user-clicked-add-puzzle-item': {
				return {
					model,
					msgCore: [
						withId(
							msg,
						),
					],
					msgCmd: [
						playSound(
							APP_SOUND.refreshFeed,
						),
						showToast(
							input.ctx.t(
								'flow.puzzle-added',
							),
						),
					],
				};
			}

			case 'pack-builder.user-closed-add-puzzle-screen': {
				return {
					model,
					msgCore: [
						withId(
							msg,
						),
					],
					msgCmd: [
						playSound(
							APP_SOUND.navBackwardMin,
						),
					],
				};
			}
		}

		return {model};
	},

	View(input) {
		return (
			<div className="flex h-full max-h-full w-full flex-col overflow-hidden">
				<div className="flex w-full shrink-0 items-center border-b border-neutral-700 p-4 text-3xl font-bold">
					<p className="flex-1">
						Add
						puzzle
					</p>
				</div>
				<div className="h-full max-h-full w-full max-w-full flex-1 overflow-hidden overflow-y-scroll">
					<FlowPuzzleListClient.View
						ctx={
							input.ctx
						}
						dispatch={(
							c,
						) =>
							input.dispatch(
								{
									t: 'flow-puzzle-list',
									c,
								},
							)
						}
						model={
							input
								.model
								.flowPuzzleList
						}
						emits={{
							clickedPuzzleItem: (
								puzzle,
							) =>
								input.dispatch(
									{
										t: 'pack-builder.user-clicked-add-puzzle-item',
										puzzle,
										userId: input
											.ctx
											.currentUserId,
									},
								),
						}}
					/>
				</div>
				<div className="flex w-full shrink-0 items-center justify-center border-t border-neutral-700 p-4">
					<Button
						text={input.ctx.t(
							'app.close',
						)}
						className="w-full"
						onClick={() =>
							input.dispatch(
								{
									t: 'pack-builder.user-closed-add-puzzle-screen',
								},
							)
						}
					/>
				</div>
			</div>
		);
	},
};

//
//
//
//
//
//

const ScreenPuzzleGrid: Pick<ClientModule, 'update' | 'View'> = {
	update(input) {
		const {model, msg} = input;

		switch (msg?.t) {
			case 'pack-builder.user-clicked-pack-item': {
				return {
					model,
					msgCore: [
						withId(
							msg,
						),
					],
					msgCmd: [
						playSound(
							APP_SOUND.navForwardMin,
						),
					],
				};
			}
			case 'pack-builder.user-changed-slide': {
				return {
					model,
					msgCore: [
						withId(
							msg,
						),
					],
				};
			}
		}

		return {model};
	},
	View(input) {
		const packBuilder = input.modelCore.packBuilder;

		if (!packBuilder) {
			return null;
		}
		return (
			<div className="flex w-full flex-1 flex-col items-center justify-center">
				<div className="flex w-full flex-1 flex-col">
					<TopBar
						ctx={
							input.ctx
						}
						onBack={() =>
							input.dispatch(
								{
									t: 'pack-builder.user-clicked-exit-button',
									userId: input
										.ctx
										.currentUserId,
								},
							)
						}
						title={input.ctx.t(
							'flow-pack-name',
							packBuilder
								.pack
								.name,
						)}
					/>
					<div className="flex w-full flex-1 flex-col items-center justify-center">
						<FlowPackPuzzlesGridUI.ViewPackPuzzleGrid
							id={
								packBuilder
									.pack
									.id
							}
							slideIndex={ScreenPackBuilderCore.toSlideIndex(
								packBuilder,
							)}
							puzzleIds={
								packBuilder
									.pack
									.puzzleIds
							}
							onSlideIndexChanged={(
								newSlideIndex,
							) =>
								input.dispatch(
									{
										t: 'pack-builder.user-changed-slide',
										newSlideIndex,
										userId: input
											.ctx
											.currentUserId,
									},
								)
							}
							renderCell={(
								inputCell,
							) => {
								const puzzleId =
									packBuilder
										.pack
										.puzzleIds[
										inputCell
											.index
									];

								if (
									puzzleId
								) {
									const puzzle =
										puzzleId
											? input
													.model
													.puzzles[
													puzzleId
											  ]
											: null;

									if (
										!puzzle
									) {
										return (
											<FlowPackPuzzlesGridUI.ViewLoadingCell />
										);
									}

									return (
										<FlowPackPuzzlesGridUI.ViewPuzzleCell
											onClick={() =>
												input.dispatch(
													{
														t: 'pack-builder.user-clicked-pack-item',
														puzzle,
														puzzleIndex: inputCell.index,
													},
												)
											}
											index={
												inputCell.index
											}
										/>
									);
								}

								if (
									inputCell.index ===
									packBuilder
										.pack
										.puzzleIds
										.length
								) {
									return (
										<ButtonAddPuzzle.View
											{...input}
										/>
									);
								}

								return (
									<FlowPackPuzzlesGridUI.ViewEmptyCell />
								);
							}}
						/>
					</div>
				</div>
			</div>
		);
	},
};

//
//
//
//
//
//
//

export const ScreenPuzzleMore: Pick<ClientModule, 'update' | 'View'> = {
	update(input) {
		const {model, msg} = input;

		switch (msg?.t) {
			case 'pack-builder.puzzle-screen.user-closed-more-drawer':
			case 'pack-builder.puzzle-screen.user-clicked-more-button': {
				return {
					model,
					msgCore: [
						withId(
							msg,
						),
					],
					msgCmd: [
						playSound(
							APP_SOUND.tap,
						),
					],
				};
			}
		}

		return {model};
	},

	View(input) {
		const {dispatch, ctx, modelCore} = input;

		if (!modelCore.packBuilder) {
			return null;
		}

		const screen = modelCore.packBuilder.screen;

		if (screen.t !== 'screen-puzzle') {
			return null;
		}

		return (
			<>
				<ViewBottomButtonBarAction
					icon={(
						input,
					) => (
						<IconEllipsisVertical
							{...input}
						/>
					)}
					label={ctx.t(
						'app.more',
					)}
					onClick={() =>
						dispatch(
							{
								t: 'pack-builder.puzzle-screen.user-clicked-more-button',
								userId: ctx.currentUserId,
							},
						)
					}
				/>
				<Drawer
					id="screen-puzzle-more"
					open={
						screen.opened ===
						'more'
					}
					onClose={() =>
						dispatch(
							{
								t: 'pack-builder.puzzle-screen.user-closed-more-drawer',
								userId: ctx.currentUserId,
							},
						)
					}
					position="bottom"
				>
					<ListItemButton
						icon={(
							inputIcon,
						) => (
							<IconDeleteForever
								{...inputIcon}
							/>
						)}
						label={input.ctx.t(
							'flow.remove-from-pack',
						)}
						color="danger"
						onClick={() =>
							dispatch(
								{
									t: 'remove-puzzle-from-pack.user-clicked-remove-from-pack-button',
									userId: ctx.currentUserId,
									puzzleIndex: screen.puzzleIndex,
								},
							)
						}
					/>
					<div className="w-full p-2" />
				</Drawer>
			</>
		);
	},
};

export const ScreenPuzzle: Pick<ClientModule, 'update' | 'View'> = {
	update(input) {
		const {model, msg} = input;

		switch (msg?.t) {
			case 'pack-builder.puzzle-screen.user-clicked-exit-puzzle': {
				return {
					model,
					msgCore: [
						withId(
							msg,
						),
					],
					msgCmd: [
						playSound(
							APP_SOUND.navBackwardMin,
						),
					],
				};
			}

			case 'pack-builder.flow-play-ui': {
				return {
					model,
					msgCore: [
						withId(
							msg,
						),
					],
				};
			}

			case 'pack-builder.puzzle-screen.user-clicked-previous-puzzle-button': {
				return {
					model,
					msgCore: [
						withId(
							msg,
						),
					],
					msgCmd: [
						playSound(
							APP_SOUND.tap,
						),
					],
				};
			}

			case 'pack-builder.puzzle-screen.user-clicked-next-puzzle': {
				return {
					model,
					msgCore: [
						withId(
							msg,
						),
					],
					msgCmd: [
						playSound(
							APP_SOUND.tap,
						),
					],
				};
			}

			case 'remove-puzzle-from-pack.user-clicked-remove-from-pack-button': {
				return {
					model,
					msgCore: [
						withId(
							msg,
						),
					],
					msgCmd: [
						playSound(
							APP_SOUND.refreshFeed,
						),
						showToast(
							input.ctx.t(
								'flow.puzzle-removed',
							),
						),
					],
				};
			}
		}

		return {model};
	},

	View(input) {
		if (!input.modelCore.packBuilder) {
			return null;
		}

		if (
			input.modelCore.packBuilder
				.screen.t !==
			'screen-puzzle'
		) {
			return null;
		}

		const pack = input.modelCore.packBuilder.pack;
		const screen =
			input.modelCore.packBuilder
				.screen;

		const previousPuzzleId =
			pack.puzzleIds[
				screen.puzzleIndex -
					1
			];
		const previousPuzzle = previousPuzzleId
			? input.model.puzzles[
					previousPuzzleId
			  ]
			: null;
		const canGoPrevious = Boolean(previousPuzzle);

		const nextPuzzleId =
			pack.puzzleIds[
				screen.puzzleIndex +
					1
			];
		const nextPuzzle = nextPuzzleId
			? input.model.puzzles[
					nextPuzzleId
			  ]
			: null;
		const canGoNext = Boolean(nextPuzzle);

		return (
			<div className="flex h-full w-full flex-col">
				<TopBar
					ctx={
						input.ctx
					}
					title={input.ctx.t(
						'flow.level',
						screen.puzzleIndex +
							1,
					)}
					subtitle={input.ctx.t(
						'flow-puzzle-name',
						screen
							.puzzle
							.name,
					)}
					onBack={() =>
						input.dispatch(
							{
								t: 'pack-builder.puzzle-screen.user-clicked-exit-puzzle',
								userId: input
									.ctx
									.currentUserId,
							},
						)
					}
				/>

				<FlowPlay.View
					dispatch={(
						c,
					) =>
						input.dispatch(
							{
								t: 'pack-builder.flow-play-ui',
								c,
							},
						)
					}
					flow={
						screen
							.puzzle
							.flow
					}
					model={
						screen.playUI
					}
				/>

				<div className="flex-1" />

				<ViewBottomButtonBar>
					<ViewBottomButtonBarAction
						icon={(
							input,
						) => (
							<IconChevronLeft
								{...input}
							/>
						)}
						label={input.ctx.t(
							'app.prev',
						)}
						disabled={
							!canGoPrevious
						}
						onClick={() => {
							if (
								previousPuzzle
							) {
								input.dispatch(
									{
										t: 'pack-builder.puzzle-screen.user-clicked-previous-puzzle-button',
										userId: input
											.ctx
											.currentUserId,
										previousPuzzle,
									},
								);
							}
						}}
					/>

					<ViewBottomButtonBarAction
						icon={(
							input,
						) => (
							<IconChevronRight
								{...input}
							/>
						)}
						label={input.ctx.t(
							'app.next',
						)}
						disabled={
							!canGoNext
						}
						onClick={() => {
							if (
								nextPuzzle
							) {
								input.dispatch(
									{
										t: 'pack-builder.puzzle-screen.user-clicked-next-puzzle',
										userId: input
											.ctx
											.currentUserId,
										nextPuzzle,
									},
								);
							}
						}}
					/>

					<ScreenPuzzleMore.View
						{...input}
					/>
				</ViewBottomButtonBar>
			</div>
		);
	},
};

//
//
//
//
//
//

const PackPuzzleGrid: Pick<ClientModule, 'update' | 'subscriptions'> = {
	update(input) {
		const pack =
			input.modelCore.packBuilder
				?.pack ?? null;

		if (!pack) {
			return {
				model: input.model,
			};
		}

		const updated =
			FlowPackPuzzlesGridClient.update(
				{
					ctx: {
						...input.ctx,
						pack,
					},
					model: {
						...FlowPackPuzzlesGridClient.initClient,
						...input
							.model
							.packBuilder
							?.flowPackPuzzleGrid,
						puzzles: input
							.model
							.puzzles,
					},
					msg:
						input
							.msg
							?.t ===
						'pack-builder.flow-pack-grid'
							? input
									.msg
									.c
							: null,
					msgCmd: input.msgCmd,
					msgEvt: input.msgEvt,
					msgServer:
						input
							.msgServer
							?.t ===
						'pack-builder.flow-pack-grid'
							? input
									.msgServer
									.c
							: null,
				},
			);

		return {
			model: {
				...input.model,
				puzzles: {
					...input
						.model
						.puzzles,
					...updated
						.model
						?.puzzles,
				},
				packBuilder: {
					...input
						.model
						.packBuilder,
					flowPackPuzzleGrid: updated.model,
				},
			},
			eff: Eff.tag(
				'pack-builder.flow-pack-grid',
				updated.eff,
			),
			msgCmd: SpaceClientCmd.tag(
				'pack-builder.flow-pack-grid',
				updated.msgCmd,
			),
			msgEvt: updated.msgEvt,
		};
	},
	subscriptions(input) {
		const pack = input.modelCore.packBuilder?.pack;
		if (!pack) {
			return Sub.None;
		}
		return Sub.tag(
			'pack-builder.flow-pack-grid',
			FlowPackPuzzlesGridClient.subscriptions(
				{
					ctx: {
						...input.ctx,
						pack,
					},
					model: input
						.model
						.packBuilder
						.flowPackPuzzleGrid,
				},
			),
		);
	},
};

//
//
//
//
//
//

const EditPackName: Pick<ClientModule, 'update' | 'View'> = {
	update(input) {
		if (!input.modelCore.packBuilder) {
			return {
				model: input.model,
			};
		}
		const updated = EditPackNameClient.update({
			...input,
			modelCore: input.modelCore
				.packBuilder
				.editPackName,
			msg:
				input.msgCore
					?.t ===
				'got-edit-pack-name'
					? input
							.msgCore
							.c
					: null,
			msgCore:
				input.msgCore
					?.t ===
				'got-edit-pack-name'
					? {
							...input.msgCore,
							...input
								.msgCore
								.c,
					  }
					: null,
		});
		return {
			model: input.model,
			msgCore: (
				updated.msgCore ??
				[]
			).map((c) => ({
				c,
				t: 'got-edit-pack-name',
				eventId: c.eventId,
			})),
		};
	},
	View(input) {
		if (!input.modelCore.packBuilder) {
			return null;
		}
		return (
			<>
				<EditPackNameClient.ViewDrawer
					ctx={
						input.ctx
					}
					model={
						input
							.modelCore
							.packBuilder
							.editPackName
					}
					modelCore={
						input
							.modelCore
							.packBuilder
							.editPackName
					}
					dispatch={(
						c,
					) =>
						input.dispatch(
							{
								t: 'got-edit-pack-name',
								c,
							},
						)
					}
				/>
			</>
		);
	},
};

const updateRecordPack: ClientModule['update'] = (input) => {
	if (input.modelCore.packBuilder?.pack) {
		return {
			model: {
				...input.model,
				packs: {
					...input
						.model
						.packs,
					[input
						.modelCore
						.packBuilder
						.pack
						.id]:
						input
							.modelCore
							.packBuilder
							.pack,
				},
			},
		};
	}
	return {model: input.model};
};
export const ScreenPackBuilderClient: Pick<
	ClientModule,
	'update' | 'View' | 'subscriptions'
> = {
	update(input) {
		return GameClientModule.andThen(
			{
				model: input.model,
			},
			(model) =>
				ButtonExitBuilder.update(
					{
						...input,
						model,
					},
				),
			(model) =>
				ScreenAddPuzzle.update(
					{
						...input,
						model,
					},
				),
			(model) =>
				ButtonAddPuzzle.update(
					{
						...input,
						model,
					},
				),
			(model) =>
				ScreenPuzzleGrid.update(
					{
						...input,
						model,
					},
				),
			(model) =>
				ScreenPuzzle.update(
					{
						...input,
						model,
					},
				),
			(model) =>
				PackPuzzleGrid.update(
					{
						...input,
						model,
					},
				),
			(model) =>
				ScreenPuzzleMore.update(
					{
						...input,
						model,
					},
				),
			(model) =>
				EditPackName.update(
					{
						...input,
						model,
					},
				),
			(model) =>
				updateRecordPack(
					{
						...input,
						model,
					},
				),
		);
	},

	View(input) {
		return (
			<div className="flex h-full w-full flex-col">
				<FlowPackPuzzlesGridClient.ViewObserver
					dispatch={(
						c,
					) =>
						input.dispatch(
							{
								t: 'pack-builder.flow-pack-grid',
								c,
							},
						)
					}
				/>
				<ViewScreen
					{...input}
				/>
			</div>
		);
	},

	subscriptions(input) {
		return PackPuzzleGrid.subscriptions(input);
	},
};

const ViewScreen: ClientModule['View'] = (input) => {
	switch (input.modelCore.packBuilder?.screen.t) {
		case 'screen-add-puzzle': {
			return (
				<ScreenAddPuzzle.View
					{...input}
				/>
			);
		}

		case 'screen-puzzle-grid': {
			return (
				<ScreenPuzzleGrid.View
					{...input}
				/>
			);
		}

		case 'screen-puzzle': {
			return (
				<ScreenPuzzle.View
					{...input}
				/>
			);
		}

		default: {
			return null;
		}
	}
};
