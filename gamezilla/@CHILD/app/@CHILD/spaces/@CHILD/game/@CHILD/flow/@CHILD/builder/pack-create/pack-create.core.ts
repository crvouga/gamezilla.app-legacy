import { UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { RemoteResult, Result } from "gamezilla/@SHARED/core";
import { FlowPack } from "../../../@SHARED/flow-pack/flow-pack";

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
  t: "pack-create/user-clicked-create-button";
};

export type ServerMsg = { t: "noop" };

export type ToServer = { t: "pack-create/user-clicked-create-button" };

export type ToClient = {
  t: "created-pack";
  created: Result<string, FlowPack>;
};

//
//
//
//
//

export type GameEvent = {
  t: "user-created-pack";
  created: Result<string, FlowPack>;
  userId: UserId;
};
