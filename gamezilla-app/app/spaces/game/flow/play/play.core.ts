import { GameCoreModule } from "gamezilla-app/app/spaces/@/architecture/game-sync";
import { SpaceCtx } from "gamezilla-app/app/spaces/@/space";
import { ModelCore, MsgCore } from "./play.types";
import { samples } from "../@/flow/flow-variant/flow-grid/flow-grid-samples";
import { FlowVariantUIPlay } from "../@/flow";

type Module = GameCoreModule<{
	Ctx: SpaceCtx;
	ModelCore: ModelCore;
	MsgCore: MsgCore;
}>;

export const initCore: Module["initCore"] = () => {
	const flow = samples["8x8"][1];
	return {
		play: FlowVariantUIPlay.init({
			flow,
		}),
		flow,
		screen: {
			t: "select-pack",
		},
	};
};

export const updateCore: Module["updateCore"] = ({ modelCore, msgCore }) => {
	switch (msgCore.t) {
		case "flow-play-ui": {
			const gridPlayNew = FlowVariantUIPlay.update({
				msg: msgCore.c,
				model: modelCore.play,
				flow: modelCore.flow,
			});
			return { ...modelCore, play: gridPlayNew };
		}
		case "user-clicked-pack-list-item": {
			return {
				...modelCore,
				screen: {
					t: "pack",
					pack: msgCore.pack,
				},
			};
		}
		case "user-clicked-exit-pack-button": {
			return {
				...modelCore,
				screen: {
					t: "select-pack",
				},
			};
		}
		default: {
			return modelCore;
		}
	}
};

export const PlayCore = {
	initCore,
	updateCore,
};
