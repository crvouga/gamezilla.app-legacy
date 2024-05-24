import { withId } from "gamezilla-app/app/spaces/@/event";
import { ViewBottomBarExitButton } from "../../../@/game";
import { ViewScreenTitle } from "../../../@/game/view-screen-title";
import { FlowPackGridUI } from "../../@/flow-pack/flow-pack-grid/flow-pack-grid-ui";
import { ClientModule } from "../play.types";

const update: ClientModule["update"] = (input) => {
	switch (input.msg?.t) {
		case "user-clicked-exit-pack-button": {
			return {
				model: input.model,
				msgCore: [withId({ t: "user-clicked-exit-pack-button" })],
			};
		}
	}
	return {
		model: input.model,
	};
};

const View: ClientModule["View"] = (input) => {
	if (input.modelCore.screen.t !== "pack") {
		return null;
	}
	return (
		<div className="w-full h-full flex-1 flex flex-col">
			<ViewScreenTitle title={input.modelCore.screen.pack.name} />
			<div className="flex-1">
				<FlowPackGridUI.ViewPackPuzzleGrid
					id="pack-puzzle-grid"
					onSlideIndexChanged={() => {}}
					puzzleIds={[]}
					renderCell={() => <FlowPackGridUI.ViewEmptyCell />}
					slideIndex={0}
				/>
			</div>
			<ViewBottomBarExitButton
				ctx={input.ctx}
				onClick={() => input.dispatch({ t: "user-clicked-exit-pack-button" })}
			/>
		</div>
	);
};

export const ScreenPackClient = {
	update,
	View,
};
