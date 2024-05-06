import type { FlowPack } from "../../../@/flow-pack/flow-pack";

export type ModelClient = {};

export const initClient: ModelClient = {};

export type MsgClient = {
	t: "pack-list.clicked-pack-item";
	pack: FlowPack;
};

export type MsgCore = {
	t: "pack-list.user-clicked-pack-item";
	pack: FlowPack;
};
