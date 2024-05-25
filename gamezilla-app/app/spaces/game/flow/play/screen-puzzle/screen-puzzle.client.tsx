import { withId } from "gamezilla-app/app/spaces/@/event";
import {
	ViewBottomButtonBar,
	ViewBottomButtonBarActionExit,
	ViewBottomButtonBarActionNext,
} from "../../../@/game";
import { ViewScreenTitle } from "../../../@/game/view-screen-title";
import { FlowVariantUIPlay } from "../../@/flow";
import { ClientModule } from "../play.types";

const update: ClientModule["update"] = (input) => {
	switch (input.msg?.t) {
		case "user-clicked-exit-puzzle-button": {
			return {
				model: input.model,
				msgCore: [withId(input.msg)],
			};
		}
		case "got-puzzle-screen-flow-play-msg": {
			return {
				model: input.model,
				msgCore: [withId(input.msg)],
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
	//
	const nextPuzzleIndex = puzzleIndex + 1;
	const nextPuzzleId =
		input.modelCore.screen.flowPack.puzzleIds[nextPuzzleIndex];
	const nextPuzzle = nextPuzzleId
		? input.model.flowPuzzles[nextPuzzleId]
		: null;
	return (
		<div className="w-full flex flex-col flex-1">
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
