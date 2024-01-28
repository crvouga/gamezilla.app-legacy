import { UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { RemoteResult } from "gamezilla/@SHARED/core";
import { IFlowPuzzleDb } from "../../../@SHARED/flow-puzzle-db";
import { FlowPuzzleId } from "../../../@SHARED/flow-puzzle/flow-puzzle-id";

export type ClientModel = {
  deleteForeverRequest: RemoteResult<string, null>;
};

export type ServerModel = {};

//
//
//
//

export type ClientMsg =
  | { t: "delete-forever/user-clicked-button" }
  | { t: "delete-forever/user-closed-drawer" }
  | { t: "delete-forever/user-confirmed" };

export type ToServer = { t: "delete-forever/user-confirmed" };

export type ToClient = { t: "noop" };

export type ServerMsg = { t: "noop" };

//
//
//
//

export type GameEvent = {
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
