import { p } from "gamezilla-app/@/core/parser";
import  { FlowPack } from "../../../@/flow-pack/flow-pack";

export type ModelClient = {};

export const initClient: ModelClient = {};

export type MsgClient = {
	t: "pack-list.clicked-pack-item";
	pack: FlowPack;
};

export const MsgCore = p.obj({
	t: p.l("pack-list.user-clicked-pack-item"),
	pack: FlowPack,
});
export type MsgCore = p.Infer<typeof MsgCore>;
