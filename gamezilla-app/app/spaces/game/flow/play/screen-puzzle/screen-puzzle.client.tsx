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

const update: ClientModule["update"] = (input) => {
	switch (input.msg?.t) {
		case "user-clicked-exit-puzzle-button":
		case "user-clicked-next-puzzle-button":
		case 'user-clicked-prev-puzzle-button':
		case "got-puzzle-screen-flow-play-msg": {
			return {
				model: input.model,
				msgCore: [withId(input.msg)],
			};
		}
	}
	switch (input.msgCore?.t) {
		case "user-clicked-next-puzzle-button": {
			return {
				model: input.model,
				msgCmd: [playSound(APP_SOUND.navForwardMin)],
			};
		}
		case "user-clicked-prev-puzzle-button": {
			return {
				model: input.model,
				msgCmd: [playSound(APP_SOUND.navBackwardMin)],
			};
		}
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
		<div className="w-full flex flex-col flex-1" data-puzzle-id={flowPuzzle.id}>
			<ViewScreenTitle title={flowPuzzle.name} />
			<div className="flex-1 flex flex-col items-center justify-center">
				<FlowVariantUIPlay.View
					flow={flowPuzzle.flow}
					dispatch={(c) =>
						input.dispatch({ t: "got-puzzle-screen-flow-play-msg", c })
					}
					model={flowPlay}
				/>
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
