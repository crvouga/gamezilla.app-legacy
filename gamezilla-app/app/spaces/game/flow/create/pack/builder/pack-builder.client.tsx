import { Eff, Sub } from "gamezilla-app/@/core";
import { APP_SOUND, playSound, showToast } from "gamezilla-app/app/@/client";
import {
	Button,
	Drawer,
	IconArrowLeftOnRect,
	IconChevronLeft,
	IconChevronRight,
	IconDeleteForever,
	IconEllipsisVertical,
	ListItemButton,
} from "gamezilla-app/app/@/ui";
import { GameClientModule } from "gamezilla-app/app/spaces/@/architecture/game-client-v2";
import { withId } from "gamezilla-app/app/spaces/@/event";
import { SpaceClientCmd } from "gamezilla-app/app/spaces/@/space-client-cmd";
import {
	ViewBottomButtonBar,
	ViewBottomButtonBarAction,
} from "../../../../@/game";
import { FlowVariantUIPlay } from "../../../@/flow";
import { FlowPackGridUI } from "../../../@/flow-pack/flow-pack-grid/flow-pack-grid-ui";
import { FlowPackGridClient } from "../../../@/flow-pack/flow-pack-grid/flow-pack-grid.client";
import { FlowPuzzleListClient } from "../../../@/flow-puzzle/flow-puzzle-list";
import type { ClientModule } from "../../create.types";

//
//
//
//
//
//

const ButtonExitBuilder: Pick<ClientModule, "update" | "View"> = {
	update(input) {
		const { model, msg, msgCore } = input;

		switch (msg?.t) {
			case "pack-builder.user-clicked-exit-button": {
				return { model, msgCore: [withId(msg)] };
			}
		}

		switch (msgCore?.t) {
			case "pack-builder.user-clicked-exit-button": {
				return {
					model,
					msgCmd: [playSound(APP_SOUND.navBackwardMin)],
				};
			}
		}

		return { model };
	},

	View(input) {
		return (
			<Button
				start={<IconArrowLeftOnRect className="h-6 w-6" />}
				className="w-full"
				text="Exit"
				onClick={() =>
					input.dispatch({
						t: "pack-builder.user-clicked-exit-button",
						userId: input.ctx.currentUserId,
					})
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

const ButtonAddPuzzle: Pick<ClientModule, "update" | "View"> = {
	update(input) {
		const { model, msg } = input;

		switch (msg?.t) {
			case "pack-builder.user-clicked-open-add-puzzle-button": {
				return {
					model,
					msgCore: [withId(msg)],
					msgCmd: [playSound(APP_SOUND.navForwardMin)],
				};
			}
		}
		return { model };
	},

	View(input) {
		return (
			<FlowPackGridUI.ViewAddCell
				onClick={() =>
					input.dispatch({
						t: "pack-builder.user-clicked-open-add-puzzle-button",
						userId: input.ctx.currentUserId,
					})
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

const ScreenAddPuzzle: Pick<ClientModule, "update" | "View"> = {
	update(input) {
		const { model, msg } = input;

		switch (msg?.t) {
			case "pack-builder.user-clicked-add-puzzle-item": {
				return {
					model,
					msgCore: [withId(msg)],
					msgCmd: [playSound(APP_SOUND.refreshFeed), showToast("Puzzle added")],
				};
			}

			case "pack-builder.user-closed-add-puzzle": {
				return {
					model,
					msgCore: [withId(msg)],
					msgCmd: [playSound(APP_SOUND.navBackwardMin)],
				};
			}
		}

		return { model };
	},

	View(input) {
		return (
			<div className="flex h-full max-h-full w-full flex-col overflow-hidden">
				<div className="flex w-full shrink-0 items-center border-b border-neutral-700 p-4 text-3xl font-bold">
					<p className="flex-1">Add puzzle</p>
				</div>
				<div className="h-full max-h-full w-full max-w-full flex-1 overflow-hidden overflow-y-scroll">
					<FlowPuzzleListClient.View
						ctx={input.ctx}
						dispatch={(c) => input.dispatch({ t: "flow-puzzle-list", c })}
						model={input.model.flowPuzzleList}
						emits={{
							clickedPuzzleItem: (puzzle) =>
								input.dispatch({
									t: "pack-builder.user-clicked-add-puzzle-item",
									puzzle,
									userId: input.ctx.currentUserId,
								}),
						}}
					/>
				</div>
				<div className="flex w-full shrink-0 items-center justify-center border-t border-neutral-700 p-4">
					<Button
						text="Close"
						className="w-full"
						onClick={() =>
							input.dispatch({ t: "pack-builder.user-closed-add-puzzle" })
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

const ScreenPuzzleGrid: Pick<ClientModule, "update" | "View"> = {
	update(input) {
		const { model, msg } = input;

		switch (msg?.t) {
			case "pack-builder.user-clicked-pack-item": {
				return {
					model,
					msgCore: [withId(msg)],
					msgCmd: [playSound(APP_SOUND.navForwardMin)],
				};
			}
		}

		return { model };
	},
	View(input) {
		const { modelCore, model } = input;

		const packBuilder = modelCore.packBuilder;

		if (!packBuilder) {
			return null;
		}
		return (
			<div className="flex w-full flex-1 flex-col items-center justify-center">
				<div className="flex w-full flex-1 flex-col">
					<p className="w-full p-3 text-3xl font-bold">
						{packBuilder.pack.name}
					</p>
					<div className="flex w-full flex-1 flex-col items-center justify-center">
						<FlowPackGridUI.ViewPackPuzzleGrid
							puzzleIds={packBuilder.pack.puzzleIds}
							renderCell={(props) => {
								const puzzleId = packBuilder.pack.puzzleIds[props.index];

								if (puzzleId) {
									const puzzle = puzzleId ? model.puzzles[puzzleId] : null;

									if (!puzzle) {
										return <FlowPackGridUI.ViewLoadingCell />;
									}

									return (
										<FlowPackGridUI.ViewPuzzleCell
											onClick={() =>
												input.dispatch({
													t: "pack-builder.user-clicked-pack-item",
													puzzle,
													index: props.index,
												})
											}
											index={props.index}
										/>
									);
								}

								if (props.index === packBuilder.pack.puzzleIds.length) {
									return <ButtonAddPuzzle.View {...input} />;
								}

								return <FlowPackGridUI.ViewEmptyCell />;
							}}
						/>
					</div>
				</div>

				<div className="w-full border-t border-neutral-700 p-4">
					<ButtonExitBuilder.View {...input} />
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

export const ScreenPuzzleMore: Pick<ClientModule, "update" | "View"> = {
	update(input) {
		const { model, msg } = input;

		switch (msg?.t) {
			case "pack-builder.puzzle-screen.user-closed-more-drawer":
			case "pack-builder.puzzle-screen.user-clicked-more-button": {
				return {
					model,
					msgCore: [withId(msg)],
					msgCmd: [playSound(APP_SOUND.tap)],
				};
			}
		}

		return { model };
	},

	View(input) {
		const { dispatch, ctx, modelCore } = input;

		if (!modelCore.packBuilder) {
			return null;
		}

		const screen = modelCore.packBuilder.screen;

		if (screen.t !== "screen-puzzle") {
			return null;
		}

		return (
			<>
				<ViewBottomButtonBarAction
					icon={(props) => <IconEllipsisVertical {...props} />}
					label="More"
					onClick={() =>
						dispatch({
							t: "pack-builder.puzzle-screen.user-clicked-more-button",
							userId: ctx.currentUserId,
						})
					}
				/>
				<Drawer
					id="screen-puzzle-more"
					open={screen.opened === "more"}
					onClose={() =>
						dispatch({
							t: "pack-builder.puzzle-screen.user-closed-more-drawer",
							userId: ctx.currentUserId,
						})
					}
					position="bottom"
				>
					<ListItemButton
						icon={(props) => <IconDeleteForever {...props} />}
						label="Remove from pack"
						color="danger"
						onClick={() =>
							dispatch({
								t: "pack-builder.puzzle-screen.user-clicked-remove-from-pack-button",
								userId: ctx.currentUserId,
								puzzleIndex: screen.puzzleIndex,
							})
						}
					/>
					<div className="w-full p-2"></div>
				</Drawer>
			</>
		);
	},
};

export const ScreenPuzzle: Pick<ClientModule, "update" | "View"> = {
	update(input) {
		const { model, msg } = input;

		switch (msg?.t) {
			case "pack-builder.user-clicked-exit-puzzle-button": {
				return {
					model,
					msgCore: [withId(msg)],
					msgCmd: [playSound(APP_SOUND.navBackwardMin)],
				};
			}

			case "pack-builder.flow-play-ui": {
				return {
					model,
					msgCore: [withId(msg)],
				};
			}

			case "pack-builder.user-clicked-previous-puzzle-button": {
				return {
					model,
					msgCore: [withId(msg)],
					msgCmd: [playSound(APP_SOUND.tap)],
				};
			}

			case "pack-builder.user-clicked-next-puzzle-button": {
				return {
					model,
					msgCore: [withId(msg)],
					msgCmd: [playSound(APP_SOUND.tap)],
				};
			}

			case "pack-builder.puzzle-screen.user-clicked-remove-from-pack-button": {
				return {
					model,
					msgCore: [withId(msg)],
					msgCmd: [
						playSound(APP_SOUND.refreshFeed),
						showToast("Puzzle removed"),
					],
				};
			}
		}

		return { model };
	},

	View(input) {
		if (!input.modelCore.packBuilder) {
			return null;
		}

		if (input.modelCore.packBuilder.screen.t !== "screen-puzzle") {
			return null;
		}

		const pack = input.modelCore.packBuilder.pack;
		const screen = input.modelCore.packBuilder.screen;

		const previousPuzzleId = pack.puzzleIds[screen.puzzleIndex - 1];
		const previousPuzzle = previousPuzzleId
			? input.model.puzzles[previousPuzzleId]
			: null;
		const canGoPrevious = Boolean(previousPuzzle);

		const nextPuzzleId = pack.puzzleIds[screen.puzzleIndex + 1];
		const nextPuzzle = nextPuzzleId ? input.model.puzzles[nextPuzzleId] : null;
		const canGoNext = Boolean(nextPuzzle);

		return (
			<div className="flex h-full w-full flex-col">
				<div className="flex flex-1 flex-col gap-1 px-4 py-4">
					<p className="text-3xl font-bold">Level {screen.puzzleIndex + 1}</p>
					<p className="text-xs text-neutral-300">{screen.puzzle.name}</p>
				</div>

				<FlowVariantUIPlay.View
					dispatch={(c) =>
						input.dispatch({ t: "pack-builder.flow-play-ui", c })
					}
					flow={screen.puzzle.flow}
					model={screen.playUI}
				/>

				<div className="flex-1"></div>

				<ViewBottomButtonBar>
					<ViewBottomButtonBarAction
						icon={(props) => <IconArrowLeftOnRect {...props} />}
						label="Exit"
						onClick={() =>
							input.dispatch({
								t: "pack-builder.user-clicked-exit-puzzle-button",
								userId: input.ctx.currentUserId,
							})
						}
					/>

					<ViewBottomButtonBarAction
						icon={(props) => <IconChevronLeft {...props} />}
						label="Previous"
						disabled={!canGoPrevious}
						onClick={() => {
							if (previousPuzzle) {
								input.dispatch({
									t: "pack-builder.user-clicked-previous-puzzle-button",
									userId: input.ctx.currentUserId,
									previousPuzzle,
								});
							}
						}}
					/>

					<ViewBottomButtonBarAction
						icon={(props) => <IconChevronRight {...props} />}
						label="Next"
						disabled={!canGoNext}
						onClick={() => {
							if (nextPuzzle) {
								input.dispatch({
									t: "pack-builder.user-clicked-next-puzzle-button",
									userId: input.ctx.currentUserId,
									nextPuzzle,
								});
							}
						}}
					/>

					<ScreenPuzzleMore.View {...input} />
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

const PuzzleGrid: Pick<ClientModule, "update" | "subscriptions"> = {
	update(input) {
		const pack = input.modelCore.packBuilder?.pack;

		if (!pack) {
			return { model: input.model };
		}

		const ctx = { ...input.ctx, pack };

		const initial = FlowPackGridClient.init({ ctx });

		const model = input.model.packBuilder.flowPackPuzzleGrid ?? initial.model;

		const updated = FlowPackGridClient.update({
			ctx,
			model: { ...model, puzzles: input.model.puzzles },
			msg: input.msg?.t === "pack-builder.flow-pack-grid" ? input.msg.c : null,
			msgCmd: input.msgCmd,
			msgEvt: input.msgEvt,
			msgServer:
				input.msgServer?.t === "pack-builder.flow-pack-grid"
					? input.msgServer.c
					: null,
		});

		return {
			model: {
				...input.model,
				puzzles: {
					...input.model.puzzles,
					...updated.model.puzzles,
				},
				packBuilder: {
					...input.model.packBuilder,
					flowPackPuzzleGrid: updated.model,
				},
			},
			eff: Eff.tag("pack-builder.flow-pack-grid", updated.eff),
			msgCmd: SpaceClientCmd.tag("pack-builder.flow-pack-grid", updated.msgCmd),
			msgEvt: updated.msgEvt,
		};
	},
	subscriptions(input) {
		const pack = input.modelCore.packBuilder?.pack;
		return Sub.tag(
			"pack-builder.flow-pack-grid",
			FlowPackGridClient.subscriptions({
				ctx: { ...input.ctx, pack },
				model: input.model.packBuilder.flowPackPuzzleGrid,
			}),
		);
	},
};

//
//
//
//
//
//

export const PackBuilderClient: Pick<
	ClientModule,
	"update" | "View" | "subscriptions"
> = {
	update(input) {
		return GameClientModule.andThen(
			{ model: input.model },
			(model) => ButtonExitBuilder.update({ ...input, model }),
			(model) => ScreenAddPuzzle.update({ ...input, model }),
			(model) => ButtonAddPuzzle.update({ ...input, model }),
			(model) => ScreenPuzzleGrid.update({ ...input, model }),
			(model) => ScreenPuzzle.update({ ...input, model }),
			(model) => PuzzleGrid.update({ ...input, model }),
			(model) => ScreenPuzzleMore.update({ ...input, model }),
			(model) => {
				if (input.modelCore.packBuilder?.pack) {
					return {
						model: {
							...model,
							packs: {
								...model.packs,
								[input.modelCore.packBuilder.pack.id]:
									input.modelCore.packBuilder.pack,
							},
						},
					};
				}
				return { model };
			},
		);
	},

	View(input) {
		const { modelCore, model } = input;

		return (
			<FlowPackGridClient.View
				ctx={{ ...input.ctx, pack: modelCore.packBuilder?.pack }}
				model={model.packBuilder.flowPackPuzzleGrid}
				dispatch={(c) =>
					input.dispatch({ t: "pack-builder.flow-pack-grid", c })
				}
				slots={{
					grid() {
						switch (modelCore.packBuilder?.screen.t) {
							case "add-puzzle": {
								return <ScreenAddPuzzle.View {...input} />;
							}

							case "screen-puzzle-grid": {
								return <ScreenPuzzleGrid.View {...input} />;
							}

							case "screen-puzzle": {
								return <ScreenPuzzle.View {...input} />;
							}

							default: {
								return null;
							}
						}
					},
				}}
			/>
		);
	},

	subscriptions(input) {
		return PuzzleGrid.subscriptions(input);
	},
};
