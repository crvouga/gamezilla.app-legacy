import { withId } from "gamezilla-app/app/spaces/@/event";
import {
	ViewBottomButtonBar,
	ViewBottomButtonBarActionExit,
	ViewBottomButtonBarActionNext,
	ViewBottomButtonBarActionPrev,
} from "../../../@/game";
import { ViewScreenTitle } from "../../../@/game/view-screen-title";
import { FlowVariantUIPlay } from "../../@/flow";
import { ClientModule } from "../play.types";
import { APP_SOUND, playSound } from "gamezilla-app/app/@/client";
import { Button, Dialog, DialogHeader, DialogSurface } from "gamezilla-app/app/@/ui";
import { ScreenPuzzleCore } from "./screen-puzzle.core";
import { GameClientModule } from "gamezilla-app/app/spaces/@/architecture/game-client-v2";

const update: ClientModule["update"] = (input) => {
	return GameClientModule.andThen(
		{ model: input.model },
		(model) => updateWatchPuzzleComplete({ ...input, model }),
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
	}
	return {
		model: input.model,
	};
};

const updateWatchPuzzleComplete: ClientModule["update"] = (input) => {
	if (!input.msgCore) {
		return {
			model: input.model,
		};
	}
	const before = input.modelCore;
	const after = ScreenPuzzleCore.updateCore({
		ctx: input.ctx,
		modelCore: input.modelCore,
		msgCore: input.msgCore,
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
			className="w-full flex flex-col flex-1 overflow-scroll"
			data-puzzle-id={flowPuzzle.id}
		>
			<ViewScreenTitle title={`Level ${puzzleIndex + 1}`} />
			<div className="flex-1 flex flex-col items-center justify-center overflow-y-scroll">
				<FlowVariantUIPlay.View
					flow={flowPuzzle.flow}
					dispatch={(c) =>
						input.dispatch({ t: "got-puzzle-screen-flow-play-msg", c })
					}
					model={flowPlay}
				/>
				<Dialog
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
						<Button text="Next puzzle" />
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

export const ScreenPuzzleClient = {
	View,
	update,
};
