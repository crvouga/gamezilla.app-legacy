import { type RemoteResult, notAsked } from "gamezilla-app/@shared/core";
import type { UserId } from "gamezilla-app/app/@shared/data";
import type { IFlowPuzzleDb } from "../../../@shared/flow-puzzle/flow-puzzle-db";
import type { FlowPuzzleId } from "../../../@shared/flow-puzzle/flow-puzzle-id";

export type ModelClient = {
	puzzleDeleteForeverRequest: RemoteResult<string, null>;
};

export const initClient: ModelClient = {
	puzzleDeleteForeverRequest: notAsked,
};

export type ModelServer = {};

//
//
//
//

export type MsgClient =
	| { t: "delete-forever/user-clicked-delete-button" }
	| { t: "delete-forever/user-closed-drawer" }
	| { t: "delete-forever/user-clicked-confirm-button" }
	| { t: "delete-forever/user-clicked-cancel-button" };

export type MsgToServer = { t: "delete-forever/user-confirmed" };

export type MsgToClient = { t: "noop" };

export type MsgServer = { t: "noop" };

//
//
//
//

export type MsgSync = {
	t: "user-deleted-puzzle";
	deleted: Deleted;
	flowPuzzleId: FlowPuzzleId;
	userId: UserId;
};

//
//
//
//

type Deleted = Awaited<ReturnType<IFlowPuzzleDb["zap"]>>;
