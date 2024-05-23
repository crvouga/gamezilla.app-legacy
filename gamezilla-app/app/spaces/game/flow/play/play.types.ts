import { p } from "gamezilla-app/@/core/parser";
import type { GameCoreModule } from "gamezilla-app/app/spaces/@/architecture/game-sync";
import type { SpaceCtx } from "gamezilla-app/app/spaces/@/space";
import { FlowVariant, FlowVariantUIPlay } from "../@/flow";
import { FlowPackList } from "../@/flow-pack";
import { samples } from "../@/flow/flow-variant/flow-grid/flow-grid-samples";

//
//
//
//
//
//

export type ModelClient = {
	packList: FlowPackList.ModelClient;
	play: FlowVariantUIPlay.Model;
	flow: FlowVariant.Model;
};

export const ModelServer = p.obj({});
export type ModelServer = p.Infer<typeof ModelServer>;

//
//
//
//
//
//

export type MsgClient =
	| MsgCore
	| {
			t: "flow-pack-list";
			c: FlowPackList.MsgClient;
	  };

export type MsgServer = {
	t: "flow-pack-list";
	c: FlowPackList.MsgServer;
};

export type MsgToServer = {
	t: "flow-pack-list";
	c: FlowPackList.MsgToServer;
};

export type MsgToClient = {
	t: "flow-pack-list";
	c: FlowPackList.MsgToClient;
};

export const MsgCore = p.obj({
	t: p.l("flow-play-ui"),
	c: FlowVariantUIPlay.Msg,
});
export type MsgCore = p.Infer<typeof MsgCore>;

export const ModelCore = p.obj({
	play: FlowVariantUIPlay.Model,
	flow: FlowVariant.Model,
});
export type ModelCore = p.Infer<typeof ModelCore>;

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
			return { play: gridPlayNew, flow: modelCore.flow };
		}
		default: {
			return modelCore;
		}
	}
};
