import { TimeSpan } from "gamezilla-app/@/core";
import { APP_SOUND, playSound } from "gamezilla-app/app/@/client";
import {
	Button,
	Dialog,
	DialogHeader,
	DialogSurface,
	IconCheckmark,
	Transition,
} from "gamezilla-app/app/@/ui";
import { GameClientModule } from "gamezilla-app/app/spaces/@/architecture/game-client-v2";
import { withId } from "gamezilla-app/app/spaces/@/event";
import {
	ViewBottomButtonBar,
	ViewBottomButtonBarActionExit,
	ViewBottomButtonBarActionNext,
	ViewBottomButtonBarActionPrev,
} from "../../../@/game";
import { ViewScreenTitle } from "../../../@/game/view-screen-title";
import { FlowVariantUIPlay } from "../../@/flow";
import type { ClientModule } from "../play.types";
import { ScreenPuzzleCore } from "./screen-puzzle.core";

const update: ClientModule["update"] = (input) => {
	return GameClientModule.andThen(
		{ model: input.model },
		(model) => updatePuzzleCompleted({ ...input, model }),
		(model) => updateMain({ ...input, model }),
	);
};

const updateMain: ClientModule["update"] = (input) => {
	switch (input.msg?.t) {
		case "user-closed-puzzle-complete-dialog":
		case "user-clicked-exit-puzzle-button":
		case "user-clicked-next-puzzle-button":
		case "user-clicked-prev-puzzle-button":
		case "got-puzzle-screen-flow-play-msg": {
			return {
				model: input.model,
				msgCore: [withId(input.msg)],
			};
		}
	}
	switch (input.msgCore?.t) {
		case "user-clicked-exit-puzzle-button": {
			return {
				model: input.model,
				msgCmd: [playSound(APP_SOUND.navBackwardMin)],
			};
		}

		case "user-clicked-next-puzzle-button": {
			return {
				model: input.model,
				msgCmd: [playSound(APP_SOUND.tap)],
			};
		}

		case "user-clicked-prev-puzzle-button": {
			return {
				model: input.model,
				msgCmd: [playSound(APP_SOUND.tap)],
			};
		}

		case "got-puzzle-screen-flow-play-msg": {
			if (input.modelCore.screen.t !== "screen-puzzle") {
				return { model: input.model };
			}

			const output = FlowVariantUIPlay.update({
				msg: input.msgCore.c,
				model: input.modelCore.screen.flowPlay,
				flow: input.modelCore.screen.flowPuzzle.flow,
			});

			if (output.msg?.t === "play-sound") {
				return {
					model: input.model,
					msgCmd: [playSound(output.msg.src)],
				};
			}

			return {
				model: input.model,
			};
		}
	}
	return {
		model: input.model,
	};
};

const updatePuzzleCompleted: ClientModule["update"] = (input) => {
	if (!input.msgCore) {
		return {
			model: input.model,
		};
	}

	const before = input.modelCore;
	const after = ScreenPuzzleCore.updateCore({
		modelCore: input.modelCore,
		msgCore: input.msgCore,
		ctx: input.ctx,
	});

	if (
		before.screen.t !== "screen-puzzle" ||
		after.screen.t !== "screen-puzzle"
	) {
		return {
			model: input.model,
		};
	}

	const wasSolved = before.screen.opened === "puzzle-complete";
	const isSolved = after.screen.opened === "puzzle-complete";

	if (!wasSolved && isSolved) {
		return {
			model: input.model,
			msgCmd: [playSound(APP_SOUND.celebration)],
		};
	}

	return {
		model: input.model,
	};
};

const View: ClientModule["View"] = (input) => {
	if (input.modelCore.screen.t !== "screen-puzzle") {
		return null;
	}
	const flowPuzzle = input.modelCore.screen.flowPuzzle;
	const flowPlay = input.modelCore.screen.flowPlay;
	const puzzleIndex = input.modelCore.screen.puzzleIndex;

	const prevPuzzleIndex = puzzleIndex - 1;
	const prevPuzzleId =
		input.modelCore.screen.flowPack.puzzleIds[prevPuzzleIndex];
	const prevPuzzle = prevPuzzleId
		? input.model.flowPuzzles[prevPuzzleId]
		: null;

	//
	const nextPuzzleIndex = puzzleIndex + 1;
	const nextPuzzleId =
		input.modelCore.screen.flowPack.puzzleIds[nextPuzzleIndex];
	const nextPuzzle = nextPuzzleId
		? input.model.flowPuzzles[nextPuzzleId]
		: null;

	return (
		<div
			className="flex w-full flex-1 flex-col overflow-scroll"
			data-puzzle-id={flowPuzzle.id}
		>
			<ViewScreenTitle title={`Level ${puzzleIndex + 1}`} />
			<div className="relative flex flex-1 flex-col items-center justify-center overflow-y-scroll">
				<FlowVariantUIPlay.View
					key={flowPuzzle.id}
					flow={flowPuzzle.flow}
					dispatch={(c) =>
						input.dispatch({ t: "got-puzzle-screen-flow-play-msg", c })
					}
					model={flowPlay}
				/>

				<CheckmarkPopin
					open={
						input.modelCore.screen.state.t === "solved" &&
						input.modelCore.screen.opened === "puzzle-complete"
					}
				/>

				<Dialog
					delay={TimeSpan.seconds(1)}
					open={
						input.modelCore.screen.state.t === "solved" &&
						input.modelCore.screen.opened === "puzzle-complete"
					}
					onClose={() =>
						input.dispatch({ t: "user-closed-puzzle-complete-dialog" })
					}
				>
					<DialogSurface>
						<DialogHeader title={input.ctx.t("flow.puzzle-completed")} />
						{nextPuzzle && (
							<Button
								text="Next puzzle"
								onClick={() =>
									nextPuzzle &&
									input.dispatch({
										t: "user-clicked-next-puzzle-button",
										nextPuzzle,
										nextPuzzleIndex,
									})
								}
							/>
						)}
					</DialogSurface>
				</Dialog>
			</div>
			<ViewBottomButtonBar>
				<ViewBottomButtonBarActionExit
					ctx={input.ctx}
					onClick={() =>
						input.dispatch({ t: "user-clicked-exit-puzzle-button" })
					}
				/>
				<ViewBottomButtonBarActionPrev
					ctx={input.ctx}
					disabled={puzzleIndex <= 0}
					onClick={() =>
						prevPuzzle
							? input.dispatch({
									t: "user-clicked-prev-puzzle-button",
									prevPuzzle,
									prevPuzzleIndex,
								})
							: null
					}
				/>
				<ViewBottomButtonBarActionNext
					ctx={input.ctx}
					disabled={
						puzzleIndex >= input.modelCore.screen.flowPack.puzzleIds.length - 1
					}
					onClick={() =>
						nextPuzzle
							? input.dispatch({
									t: "user-clicked-next-puzzle-button",
									nextPuzzle,
									nextPuzzleIndex,
								})
							: null
					}
				/>
			</ViewBottomButtonBar>
		</div>
	);
};

const CheckmarkPopin = (input: { open: boolean }) => {
	return (
		<Transition
			id="checkmark"
			onEnter={async (node) => {
				node.style.transition = "all 0.3s ease-in-out";
				node.style.opacity = "0";
				node.style.transform = "scale(0.8)";
				await new Promise((r) => setTimeout(r, 50));
				node.style.opacity = "1";
				node.style.transform = "scale(1)";
				await new Promise((r) => setTimeout(r, 950));
				node.style.opacity = "0";
				node.style.transform = "scale(0.8)";
			}}
			onExit={async () => {}}
			mode="out-in"
		>
			{input.open && (
				<div className="absolute inset-0 flex items-center justify-center opacity-0">
					<IconCheckmark className="aspect-square w-full opacity-40" />
				</div>
			)}
		</Transition>
	);
};

export const ScreenPuzzleClient = {
	View,
	update,
};
