import { p } from "gamezilla-app/@/core/parser";
import { AnyMsg, Namespace } from "gamezilla-app/@/msg";
import type { GameCoreModule } from "gamezilla-app/app/spaces/@/architecture/game-sync";
import type { SpaceCtx } from "gamezilla-app/app/spaces/@/space";
import { FlowVariantUIPlay, FlowVariant } from "../@/flow";
import { samples } from "../@/flow/flow-variant/flow-grid/flow-grid-samples";
import { FlowPackList } from "../@/flow-pack";

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

export type MsgClient = AnyMsg;

export type MsgServer = AnyMsg;

export type MsgToServer = AnyMsg;

export type MsgToClient = AnyMsg;

export const MsgCore = AnyMsg;
export type MsgCore = p.Infer<typeof MsgCore>;

const createMsg = Namespace("flow-play");

export const GotFlowPackListClientMsg = createMsg(
	"got-flow-pack-list-client-msg",
	p.obj({
		c: FlowPackList.MsgClient,
	}),
);

export const GotFlowPackListToClientMsg = createMsg(
	"got-flow-pack-list-to-client-msg",
	p.obj({
		c: FlowPackList.MsgToClient,
	}),
);

export const GotFlowPlayMsg = createMsg(
	"got-flow-play-msg",
	p.obj({
		c: FlowVariantUIPlay.Msg,
	}),
);

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
	if (GotFlowPlayMsg.is(msgCore)) {
		const gridPlayNew = FlowVariantUIPlay.update({
			msg: msgCore.c,
			model: modelCore.play,
			flow: modelCore.flow,
		});
		return { play: gridPlayNew, flow: modelCore.flow };
	}
	return modelCore;
};
