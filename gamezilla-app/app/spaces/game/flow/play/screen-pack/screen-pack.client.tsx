import { ViewBottomBarExitButton } from "../../../@/game";
import { ViewScreenTitle } from "../../../@/game/view-screen-title";
import { FlowPackGridUI } from "../../@/flow-pack/flow-pack-grid/flow-pack-grid-ui";
import { ClientModule } from "../play.types";


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
                    onSlideIndexChanged={() => { }}
                    puzzleIds={[]}
                    renderCell={() => <FlowPackGridUI.ViewEmptyCell />}
                    slideIndex={0}
                />
            </div>
            <ViewBottomBarExitButton
                ctx={input.ctx}
                onClick={() => { }}
            />
		</div>
	);
};

export const ScreenPackClient = {
	View,
};
