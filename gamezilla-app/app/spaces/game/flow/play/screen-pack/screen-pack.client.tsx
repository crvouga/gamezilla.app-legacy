import { APP_SOUND, playSound } from "gamezilla-app/app/@/client";
import { withId } from "gamezilla-app/app/spaces/@/event";
import { ViewBottomBarExitButton } from "../../../@/game";
import { ViewScreenTitle } from "../../../@/game/view-screen-title";
import { FlowPackGridUI } from "../../@/flow-pack/flow-pack-grid/flow-pack-grid-ui";
import { ClientModule } from "../play.types";
import { FlowPackGridClient } from "../../@/flow-pack/flow-pack-grid/flow-pack-grid.client";

const update: ClientModule["update"] = (input) => {
	switch (input.msg?.t) {
		case "user-clicked-exit-pack-button":
		case "user-clicked-open-puzzle-grid-item": {
			return {
				model: input.model,
				msgCore: [withId(input.msg)],
			};
		}
	}

	switch (input.msgCore?.t) {
		case "user-clicked-exit-pack-button": {
			return {
				model: input.model,
				msgCmd: [playSound(APP_SOUND.navBackwardMin)],
			};
		}
		case "user-clicked-open-puzzle-grid-item": {
			return {
				model: input.model,
				msgCmd: [playSound(APP_SOUND.navForwardMin)],
			};
		}
	}

	return {
		model: input.model,
	};
};

const View: ClientModule["View"] = (input) => {
	if (input.modelCore.screen.t !== "screen-pack") {
		return null;
	}
	return (
		<div className="w-full h-full flex-1 flex flex-col">
			<ViewScreenTitle title={input.modelCore.screen.pack.name} />
			<div className="flex-1 flex flex-col items-center justify-center">
				<FlowPackGridClient.View
					ctx={{ ...input.ctx, pack: null }}
					dispatch={(c) => input.dispatch({ t: "flow-pack-grid", c })}
					model={{
						...input.model.flowPackGrid,
						puzzles: input.model.flowPuzzles,
					}}
					slots={{
						grid() {
							if (input.modelCore.screen.t !== "screen-pack") {
								return null;
							}
							return (
								<FlowPackGridUI.ViewPackPuzzleGrid
									id="pack-puzzle-grid"
									onSlideIndexChanged={() => {}}
									puzzleIds={input.modelCore.screen.pack.puzzleIds}
									renderCell={(props) => {
										if (!props.puzzleId) {
											return <FlowPackGridUI.ViewEmptyCell />;
										}
										const puzzle = input.model.flowPuzzles[props.puzzleId];
										if (!puzzle) {
											return <FlowPackGridUI.ViewLoadingCell />;
										}
										return (
											<FlowPackGridUI.ViewPuzzleCell
												index={props.index}
												onClick={() => {}}
											/>
										);
									}}
									slideIndex={0}
								/>
							);
						},
					}}
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
