import { UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { Result, RemoteResult } from "gamezilla/@SHARED/core";
import { FlowPuzzle } from "../../../@SHARED/flow-puzzle/flow-puzzle";

//
//
//

export type ClientModel = {
  saveChangesRequest?: RemoteResult<string, null>;
  saveChangesIsExiting?: boolean;
};

export type ServerModel = {};

//
//
//

export type ClientMsg =
  | { t: "save-changes/user-clicked-save-button" }
  | { t: "save-changes/user-clicked-cancel-exit" }
  | { t: "save-changes/user-clicked-save-and-exit" }
  | { t: "save-changes/user-clicked-discard-and-exit" };

export type ServerMsg = { t: "noop" };

export type ToServer =
  | { t: "save-changes/user-clicked-save-button"; puzzle: FlowPuzzle }
  | { t: "save-changes/user-clicked-save-and-exit"; puzzle: FlowPuzzle };

export type ToClient = { t: "noop" };

//
//
//

export type GameEvent = {
  t: "user-saved-changes";
  saved: Result<string, FlowPuzzle>;
  userId: UserId;
};
