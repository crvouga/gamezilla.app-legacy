import { withId } from "gamezilla-app/app/spaces/@/event";
import { ViewBottomBarExitButton } from "../../../@/game";
import { ViewScreenTitle } from "../../../@/game/view-screen-title";
import { ClientModule } from "../play.types";
import { FlowVariantUIPlay } from "../../@/flow";

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
			<ViewBottomBarExitButton
				ctx={input.ctx}
				onClick={() => input.dispatch({ t: "user-clicked-exit-puzzle-button" })}
			/>
		</div>
	);
};

export const ScreenPuzzleClient = {
	View,
	update,
};
