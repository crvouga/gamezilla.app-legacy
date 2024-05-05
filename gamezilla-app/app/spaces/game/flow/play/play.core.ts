import type { GameCoreModule } from "gamezilla-app/app/spaces/@/architecture/game-sync";
import type { SpaceCtx } from "gamezilla-app/app/spaces/@/space";
import { type FlowVariant, FlowVariantUIPlay } from "../@/flow";
import { samples } from "../@/flow/flow-variant/flow-grid/flow-grid-samples";
import { p } from "gamezilla-app/@/core/parser";

//
//
//
//
//
//

export type ModelClient = {
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
	| {
			t: "msgCore";
			c: MsgCore;
	  }
	| {
			t: "grid";
			c: FlowVariantUIPlay.Msg;
	  };

export type MsgServer = { t: null };

export type MsgToServer = { t: null };

export type MsgToClient = { t: null };

export type MsgCore = {
	t: "grid";
	c: FlowVariantUIPlay.Msg;
};

export type ModelCore = {
	play: FlowVariantUIPlay.Model;
	flow: FlowVariant.Model;
};

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
		case "grid": {
			const gridPlayNew = FlowVariantUIPlay.update({
				msg: msgCore.c,
				model: modelCore.play,
				flow: modelCore.flow,
			});
			return { play: gridPlayNew, flow: modelCore.flow };
		}
	}
};
