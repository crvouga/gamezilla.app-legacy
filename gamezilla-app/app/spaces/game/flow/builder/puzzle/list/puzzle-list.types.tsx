import { p } from "gamezilla-app/@/core/parser";
import { FlowPuzzle } from "../../../@/flow-puzzle/flow-puzzle";

//
//
//
//

export type ModelClient = {};

export const initClient: ModelClient = {};

export type MsgClient = {
	t: "puzzle-list.clicked-puzzle-list-item";
	puzzle: FlowPuzzle;
};

export type MsgServer = { t: "noop" };

export type MsgToServer = { t: "noop" };

export type MsgToClient = {
	t: "noop";
};

export const ModelCore = p.obj({
	t: p.l("puzzle-list"),
	puzzle: FlowPuzzle,
});
export type ModelCore = p.Infer<typeof ModelCore>;

export const MsgCore = p.obj({
	t: p.l("puzzle-list.clicked-puzzle-list-item"),
	puzzle: FlowPuzzle,
});
export type MsgCore = p.Infer<typeof MsgCore>;
