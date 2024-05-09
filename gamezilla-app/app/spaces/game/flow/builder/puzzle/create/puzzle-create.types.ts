import {
	Posix,
	type RemoteResult,
	type Result,
	NotAsked,
} from "gamezilla-app/@/core";
import type { UserId } from "gamezilla-app/app/@/data";
import type { FlowPuzzle } from "../../../@/flow-puzzle/flow-puzzle";

//
//
//
//
//

export type ModelClient = {
	puzzleCreateRequest: RemoteResult<string, null>;
	puzzleCreateRequestedAt: Posix;
};

export const initClient: ModelClient = {
	puzzleCreateRequest: NotAsked,
	puzzleCreateRequestedAt: Posix.now(),
};

export type ModelServer = {};

//
//
//
//

export type MsgClient = {
	t: "puzzle-create.user-clicked-create-button";
};

export type MsgServer = { t: "noop" };

export type MsgToServer = { t: "puzzle-create.user-clicked-create-button" };

export type MsgToClient = {
	t: "created-puzzle";
	created: Result<string, FlowPuzzle>;
};

//
//
//
//
//

export type MsgCore = {
	t: "user-created-puzzle";
	created: Result<string, FlowPuzzle>;
	userId: UserId;
};
