import { withId } from "gamezilla-app/app/spaces/@/event";
import { ViewBottomBarExitButton } from "../../../@/game";
import { ViewScreenTitle } from "../../../@/game/view-screen-title";
import { ClientModule } from "../play.types";

const update: ClientModule["update"] = (input) => {
	switch (input.msg?.t) {
		case "user-clicked-exit-puzzle-button": {
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
	const puzzle = input.modelCore.screen.flowPuzzle;
	return (
		<div className="w-full flex flex-col flex-1">
			<ViewScreenTitle title={puzzle.name} />
			<div className="flex-1"></div>
			<ViewBottomBarExitButton ctx={input.ctx} onClick={() => input.dispatch({t: 'user-clicked-exit-puzzle-button'})} />
		</div>
	);
};

export const ScreenPuzzleClient = {
	View,
	update,
};
