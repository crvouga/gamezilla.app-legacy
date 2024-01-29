import { UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { RemoteResult } from "gamezilla/@SHARED/core";
import { IFlowPuzzleDb } from "../../../@SHARED/flow-puzzle-db";
import { FlowPuzzleId } from "../../../@SHARED/flow-puzzle/flow-puzzle-id";

export type ClientModel = {
  deleteForeverRequest?: RemoteResult<string, null>;
};

export type ServerModel = {};

//
//
//
//

export type ClientMsg =
  | { t: "delete-forever/user-clicked-delete-button" }
  | { t: "delete-forever/user-closed-drawer" }
  | { t: "delete-forever/user-clicked-confirm-button" }
  | { t: "delete-forever/user-clicked-cancel-button" };

export type MsgToServer = { t: "delete-forever/user-confirmed" };

export type MsgToClient = { t: "noop" };

export type ServerMsg = { t: "noop" };

//
//
//
//

export type MsgGame = {
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
