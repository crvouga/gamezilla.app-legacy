import { UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { RemoteResult, Result } from "gamezilla/@SHARED/core";
import { FlowPack } from "../../../@SHARED/flow-pack/flow-pack";

//
//
//
//
//

export type ModelClient = {
  puzzleCreateRequest: RemoteResult<string, null>;
};

export type ModelServer = {};

//
//
//
//

export type MsgClient = {
  t: "pack-create/user-clicked-create-button";
};

export type MsgServer = { t: "noop" };

export type MsgToServer = { t: "pack-create/user-clicked-create-button" };

export type MsgToClient = {
  t: "created-pack";
  created: Result<string, FlowPack>;
};

//
//
//
//
//

export type MsgGame = {
  t: "user-created-pack";
  created: Result<string, FlowPack>;
  userId: UserId;
};
