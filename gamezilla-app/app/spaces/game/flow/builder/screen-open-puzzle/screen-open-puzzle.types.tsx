import { p } from "gamezilla-app/@/core/parser";
import { FlowPuzzle } from "../../@/flow-puzzle/flow-puzzle";
import { CreateNewPuzzleTypes } from "./create-new";

//
//
//
//

export type ModelClient = CreateNewPuzzleTypes.ModelClient;

export const initClient: ModelClient = {
	...CreateNewPuzzleTypes.initClient,
};

export type MsgClient =
	| CreateNewPuzzleTypes.MsgClient
	| {
			t: "puzzle-list.clicked-puzzle-list-item";
			puzzle: FlowPuzzle;
	  };

export type MsgServer = CreateNewPuzzleTypes.MsgServer | { t: "noop" };

export type MsgToServer = CreateNewPuzzleTypes.MsgToServer | { t: "noop" };

export type MsgToClient =
	| CreateNewPuzzleTypes.MsgToClient
	| {
			t: "noop";
	  };

export const ModelCore = p.obj({
	t: p.l("puzzle-list"),
	puzzle: FlowPuzzle,
});

export type ModelCore = p.Infer<typeof ModelCore>;

export const MsgCore = p.or(
	CreateNewPuzzleTypes.MsgCore,
	p.obj({
		t: p.l("puzzle-list.clicked-puzzle-list-item"),
		puzzle: FlowPuzzle,
	}),
);
export type MsgCore = p.Infer<typeof MsgCore>;
