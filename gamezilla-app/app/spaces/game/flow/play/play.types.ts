import { p } from "gamezilla-app/@/core/parser";
import { FlowVariant, FlowVariantUIPlay } from "../@/flow";
import { FlowPack, FlowPackList } from "../@/flow-pack";
import { FlowPackId } from "../@/flow-pack/flow-pack-id";
import { FlowPuzzle } from "../@/flow-puzzle";
import { FlowPuzzleId } from "../@/flow-puzzle/flow-puzzle-id";

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
	flowPuzzles: { [flowPuzzleId: FlowPuzzleId]: FlowPuzzle };
	flowPacks: { [flowPackId: FlowPackId]: FlowPack };
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

export const MsgCore = p.or(
	p.obj({
		t: p.l("flow-play-ui"),
		c: FlowVariantUIPlay.Msg,
	}),
	p.obj({
		t: p.l("user-clicked-pack-list-item"),
		pack: FlowPack,
	}),
);
export type MsgCore = p.Infer<typeof MsgCore>;

const Screen = p.or(
	p.obj({
		t: p.l("select-pack"),
	}),
	p.obj({
		t: p.l("pack"),
		pack: FlowPack,
	}),
);

export const ModelCore = p.obj({
	play: FlowVariantUIPlay.Model,
	flow: FlowVariant.Model,
	screen: Screen,
});
export type ModelCore = p.Infer<typeof ModelCore>;
