import { FlowVariantUIPlay } from "../../@/flow";
import { CoreModule } from "../play.types";

export const updateCore: CoreModule["updateCore"] = ({
	modelCore,
	msgCore,
}) => {
	switch (msgCore.t) {
		case "user-clicked-exit-puzzle-button": {
			switch (modelCore.screen.t) {
				case "screen-puzzle": {
					return {
						...modelCore,
						screen: {
							t: "screen-pack",
							flowPack: modelCore.screen.flowPack,
						},
					};
				}
				default: {
					return modelCore;
				}
			}
		}
		case "got-puzzle-screen-flow-play-msg": {
			switch (modelCore.screen.t) {
				case "screen-puzzle": {
					const flowPlayNew = FlowVariantUIPlay.update({
						msg: msgCore.c,
						model: modelCore.screen.flowPlay,
						flow: modelCore.screen.flowPuzzle.flow,
					});
					return {
						...modelCore,
						screen: {
							...modelCore.screen,
							flowPlay: flowPlayNew,
						},
					};
				}
				default: {
					return modelCore;
				}
			}
		}
		case "user-clicked-next-puzzle-button": {
			switch (modelCore.screen.t) {
				case "screen-puzzle": {
					return {
						...modelCore,
						screen: {
							...modelCore.screen,
							flowPuzzle: msgCore.nextPuzzle,
							puzzleIndex: msgCore.nextPuzzleIndex,
						},
					};
				}
				default: {
					return modelCore;
				}
			}
		}
		case "user-clicked-prev-puzzle-button": {
			switch (modelCore.screen.t) {
				case "screen-puzzle": {
					return {
						...modelCore,
						screen: {
							...modelCore.screen,
							flowPuzzle: msgCore.prevPuzzle,
							puzzleIndex: msgCore.prevPuzzleIndex,
						},
					};
				}
				default: {
					return modelCore;
				}
			}
		}
		default: {
			return modelCore;
		}
	}
};

export const ScreenPuzzleCore = {
	updateCore,
};
