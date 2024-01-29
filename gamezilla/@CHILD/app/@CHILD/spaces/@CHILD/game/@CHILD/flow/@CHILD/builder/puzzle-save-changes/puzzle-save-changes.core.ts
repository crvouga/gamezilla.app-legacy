import { UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { Result, RemoteResult } from "gamezilla/@SHARED/core";
import { FlowPuzzle } from "../../../@SHARED/flow-puzzle/flow-puzzle";

//
//
//

export type ModelClient = {
  saveChangesRequest?: RemoteResult<string, null>;
  saveChangesIsExiting?: boolean;
};

export type ModelServer = {};

//
//
//

export type MsgClient =
  | { t: "save-changes/user-clicked-save-button" }
  | { t: "save-changes/user-clicked-cancel-exit" }
  | { t: "save-changes/user-clicked-save-and-exit" }
  | { t: "save-changes/user-clicked-discard-and-exit" };

export type MsgServer = { t: "noop" };

export type MsgToServer =
  | { t: "save-changes/user-clicked-save-button"; puzzle: FlowPuzzle }
  | { t: "save-changes/user-clicked-save-and-exit"; puzzle: FlowPuzzle };

export type MsgToClient = { t: "noop" };

//
//
//

export type MsgGame = {
  t: "user-saved-changes";
  saved: Result<string, FlowPuzzle>;
  userId: UserId;
};
