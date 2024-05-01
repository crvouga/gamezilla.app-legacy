import {
	Posix,
	type RemoteResult,
	type Result,
	notAsked,
} from "gamezilla-app/@shared/core";
import type { UserId } from "gamezilla-app/app/@shared/data";
import type { FlowPuzzle } from "../../../@shared/flow-puzzle/flow-puzzle";

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
	puzzleCreateRequest: notAsked,
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

export type MsgSync = {
	t: "user-created-puzzle";
	created: Result<string, FlowPuzzle>;
	userId: UserId;
};
