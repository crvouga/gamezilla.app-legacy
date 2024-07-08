import type { VDom } from "gamezilla-app/@/vdom";
import { APP_SOUND, playSound } from "gamezilla-app/app/@/client";
import {
	Drawer,
	IconEllipsisVertical,
	IconPenToSquare,
	IconPlay,
	cn,
} from "gamezilla-app/app/@/ui";
import { Actions } from "gamezilla-app/app/@/ui/actions";
import { GameClientModule } from "gamezilla-app/app/spaces/@/architecture/game-client-v2";
import { withId } from "gamezilla-app/app/spaces/@/event";
import {
	GameLayout,
	ViewBottomButtonBar,
	ViewBottomButtonBarAction,
} from "gamezilla-app/app/spaces/game/@/game";
import { ViewProfileCard } from "../../../@/game/view-profile-card";
import { Flow, FlowEdit, FlowPlay, FlowVariantUI } from "../../@/flow";
import type { ClientModule } from "../builder.types";
import { DeleteForeverClient } from "./delete-forever/delete-forever.client";
import { EditPuzzleNameClient } from "./edit-puzzle-name/edit-puzzle-name.client";
import { SaveChangesClient } from "./save-changes/save-changes.client";
import { toFlow } from "./screen-puzzle-builder.types";

//
//
//
//
//
//
//

const update: ClientModule["update"] = (input) => {
	return GameClientModule.andThen(
		{ model: input.model },
		(model) => DeleteForeverClient.update({ ...input, model }),
		(model) => SaveChangesClient.update({ ...input, model }),
		(model) => EditPuzzleNameClient.update({ ...input, model }),
		(model) => updateFromMsgCore({ ...input, model }),
		(model) => updateMoreDrawer({ ...input, model }),
		(model) => updateFromMsg({ ...input, model }),
	);
};

const updateFromMsg: ClientModule["update"] = (input) => {
	const { model, msg, ctx } = input;

	switch (msg?.t) {
		case "screen-puzzle-builder.flow-ui-play":
		case "screen-puzzle-builder.flow-ui-edit": {
			return {
				model,
				msgCore: [withId(msg)],
			};
		}

		case "screen-puzzle-builder.user-clicked-edit-mode-button": {
			return {
				model,
				msgCore: [
					withId({
						t: "screen-puzzle-builder.user-clicked-edit-mode-button",
						userId: ctx.currentUserId,
					}),
				],
				msgCmd: [playSound(APP_SOUND.navBackwardMin)],
			};
		}
		case "screen-puzzle-builder.user-clicked-play-mode-button": {
			return {
				model,
				msgCore: [
					withId({
						t: "screen-puzzle-builder.user-clicked-play-mode-button",
						userId: ctx.currentUserId,
					}),
				],
				msgCmd: [playSound(APP_SOUND.navForwardMin)],
			};
		}
		case "screen-puzzle-builder.user-clicked-more-button": {
			return {
				model: { ...model, puzzleBuilderOpened: "more" },
				msgCmd: [playSound(APP_SOUND.tap)],
			};
		}
		case "screen-puzzle-builder.user-closed-more-drawer": {
			return {
				model: { ...model, puzzleBuilderOpened: null },
				msgCmd: [playSound(APP_SOUND.tap)],
			};
		}
		default: {
			return { model };
		}
	}
};

const updateFromMsgCore: ClientModule["update"] = (input) => {
	const { model, modelCore, msgCore } = input;

	switch (msgCore?.t) {
		case "screen-puzzle-builder.flow-ui-play": {
			if (modelCore.puzzleBuilder?.mode.t !== "play") {
				return { model };
			}
			const flow = toFlow(modelCore.puzzleBuilder);
			const updated = FlowPlay.update({
				msg: msgCore.c,
				model: modelCore.puzzleBuilder.play,
				flowPuzzle: {
					...modelCore.puzzleBuilder.puzzle,
					flow,
				},
			});

			if (updated.event) {
				const soundSrc = FlowPlay.eventToSoundSrc(updated.event);
				return {
					model,
					msgCmd: [playSound(soundSrc)],
				};
			}

			return { model };
		}
		case "screen-puzzle-builder.flow-ui-edit": {
			if (modelCore.puzzleBuilder?.mode.t !== "edit") {
				return { model };
			}
			const updated = FlowEdit.update({
				model: modelCore.puzzleBuilder.edit,
				msg: msgCore.c,
				flow: modelCore.puzzleBuilder.puzzle.flow,
			});

			if (!updated.msgCmd) {
				return { model };
			}

			switch (updated.msgCmd.t) {
				case "play-sound": {
					return {
						model,
						msgCmd: [playSound(updated.msgCmd.sourceSrc)],
					};
				}

				default: {
					return { model };
				}
			}
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
//

const View: ClientModule["View"] = (input) => {
	const { ctx } = input;

	const isSpectating = ctx.currentUserId !== ctx.space.hostId;

	if (isSpectating) {
		return <ViewSpectating {...input} />;
	}

	return (
		<>
			<ViewMode {...input} />
			<ViewMoreDrawer {...input} />
			<SaveChangesClient.ViewUnsavedChangesDrawer {...input} />
		</>
	);
};

const ViewMode: ClientModule["View"] = (input) => {
	const { model, modelCore, dispatch } = input;

	const puzzleBuilder = modelCore.puzzleBuilder;

	if (!puzzleBuilder) {
		return null;
	}

	const more = (
		<ViewBottomButtonBarAction
			icon={(props) => <IconEllipsisVertical {...props} />}
			label="More"
			onClick={() =>
				dispatch({ t: "screen-puzzle-builder.user-clicked-more-button" })
			}
		/>
	);

	switch (puzzleBuilder.mode.t) {
		case "edit": {
			return (
				<div className="flex h-full w-full flex-col items-center justify-center">
					<ViewModeBar
						icon={(props) => <IconPenToSquare {...props} />}
						label="Edit Mode"
						color="yellow"
					/>

					<div className="flex w-full flex-1 flex-col items-center justify-center overflow-hidden">
						<FlowEdit.View
							model={puzzleBuilder.edit}
							dispatch={(c) =>
								dispatch({
									t: "screen-puzzle-builder.flow-ui-edit",
									c,
								})
							}
						/>
					</div>

					<ViewBottomButtonBar>
						<SaveChangesClient.ViewActionButtons {...input} model={model} />

						<ViewBottomButtonBarAction
							icon={(props) => <IconPlay {...props} />}
							label="Play Mode"
							classNames={{
								button: "text-blue-500",
							}}
							onClick={() =>
								dispatch({
									t: "screen-puzzle-builder.user-clicked-play-mode-button",
								})
							}
						/>
						{more}
					</ViewBottomButtonBar>
				</div>
			);
		}

		case "play": {
			const flow = toFlow(puzzleBuilder);
			const isSolved = Flow.isSolved(flow);
			return (
				<div className="flex h-full w-full flex-col items-center justify-center">
					<ViewModeBar
						icon={(props) => <IconPlay {...props} />}
						label="Play Mode"
						color="blue"
					/>

					<div className="flex w-full flex-1 flex-col items-center justify-center overflow-hidden relative">
						<div className="flex w-full flex-1 flex-col items-center justify-center overflow-hidden" />

						<FlowPlay.View
							model={puzzleBuilder.play}
							flow={flow}
							dispatch={(c) =>
								dispatch({
									t: "screen-puzzle-builder.flow-ui-play",
									c,
								})
							}
						/>

						<FlowPlay.CheckmarkAnimation open={isSolved} />

						<div className="flex w-full flex-1 flex-col items-center justify-end overflow-hidden">
							<Actions.View
								ctx={input.ctx}
								id="hint-button"
								open={false}
								onToggle={() => {}}
								buttons={[
									FlowPlay.viewHintAction({
										ctx: input.ctx,
										dispatch: (c) =>
											dispatch({
												t: "screen-puzzle-builder.flow-ui-play",
												c,
											}),
										flowPuzzle: { ...puzzleBuilder.puzzle, flow },
										model: puzzleBuilder.play,
									}),
									FlowPlay.viewResetAction({
										ctx: input.ctx,
										dispatch: (c) =>
											dispatch({
												t: "screen-puzzle-builder.flow-ui-play",
												c,
											}),
										flowPuzzle: { ...puzzleBuilder.puzzle, flow },
										model: puzzleBuilder.play,
									}),
								]}
							/>
						</div>
					</div>

					<ViewBottomButtonBar>
						<SaveChangesClient.ViewActionButtons {...input} model={model} />

						<ViewBottomButtonBarAction
							icon={(props) => <IconPenToSquare {...props} />}
							label="Edit Mode"
							classNames={{
								button: "text-amber-500",
							}}
							onClick={() =>
								dispatch({
									t: "screen-puzzle-builder.user-clicked-edit-mode-button",
								})
							}
						/>
						{more}
					</ViewBottomButtonBar>
				</div>
			);
		}
	}
};

const ViewSpectating: ClientModule["View"] = (input) => {
	if (!input.modelCore.puzzleBuilder) {
		return null;
	}

	return (
		<GameLayout isSpectating>
			<div className="flex w-full flex-1 flex-col items-center justify-center overflow-y-scroll">
				<ViewProfileCard
					profile={input.ctx.profiles[input.ctx.space.hostId]}
					subtitle="Editor"
				/>
				<FlowVariantUI.View
					disabled
					model={toFlow(input.modelCore.puzzleBuilder)}
				/>
			</div>
		</GameLayout>
	);
};

const ViewModeBar = (props: {
	icon: (props: { className: string }) => VDom;
	label: string;
	color: "blue" | "yellow";
}) => {
	return (
		<div
			className={cn(
				"flex w-full items-center justify-center gap-2 p-1 text-xs font-bold text-white",
				props.color === "blue" ? "bg-blue-500" : "bg-amber-500",
			)}
		>
			{props.icon({ className: "h-4 w-4" })}
			{props.label}
		</div>
	);
};

export const capitalize = (s: string) => {
	return `${s.charAt(0).toUpperCase()}${s.slice(1).toLowerCase()}`;
};

//
//
//
//
//
//
//

const updateMoreDrawer: ClientModule["update"] = (input) => {
	const { msg, model } = input;
	switch (msg?.t) {
		case "screen-puzzle-builder.user-closed-more-drawer": {
			return { model: { ...model, puzzleBuilderOpened: null } };
		}
		case "screen-puzzle-builder.user-clicked-more-button": {
			return { model: { ...model, puzzleBuilderOpened: "more" } };
		}
		default: {
			return { model };
		}
	}
};

export const ViewMoreDrawer: ClientModule["View"] = (input) => {
	return (
		<Drawer
			id="more-drawer"
			open={input.model.puzzleBuilderOpened === "more"}
			onClose={() =>
				input.dispatch({ t: "screen-puzzle-builder.user-closed-more-drawer" })
			}
			position="bottom"
		>
			<EditPuzzleNameClient.View {...input} />
			<DeleteForeverClient.View {...input} />
			<div className="pb-2 w-full" />
		</Drawer>
	);
};

//
//
//
//
//
//

export const ScreenPuzzleBuilderClient = {
	update,
	View,
};
