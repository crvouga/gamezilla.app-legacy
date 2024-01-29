import { UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { Result, RemoteResult } from "gamezilla/@SHARED/core";
import { FlowPuzzle } from "../../../@SHARED/flow-puzzle/flow-puzzle";

//
//
//
//
//

export type ClientModel = {
  puzzleCreateRequest: RemoteResult<string, null>;
};

export type ServerModel = {};

//
//
//
//

export type ClientMsg = {
  t: "puzzle-create/user-clicked-create-button";
};

export type ServerMsg = { t: "noop" };

export type MsgToServer = { t: "puzzle-create/user-clicked-create-button" };

export type MsgToClient = {
  t: "created-puzzle";
  created: Result<string, FlowPuzzle>;
};

//
//
//
//
//

export type MsgGame = {
  t: "user-created-puzzle";
  created: Result<string, FlowPuzzle>;
  userId: UserId;
};
