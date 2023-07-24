import { Ok, Result } from "@gamezilla/core";
import { UserId } from "@gamezilla/shared/app";

//
//
//
// Model
//
//
//

export type SharedModel = {
  t: null;
};

export const initShared: SharedModel = {
  t: null,
};

export type ClientModel = SharedModel;

export type ServerModel = SharedModel;

//
//
//
// Msg
//
//
//

export type ClientMsg = Req;

export type ServerMsg = { t: null };

export type ToClient = Res;

export type ToServer = Req;

//
//
//
//
//
//

export type Req = { t: null };

export type Res = Req & { result: Result<string, SharedModel> };

export const handle = (input: {
  msg: Req;
  model: ServerModel;
  ctx: { currentUserId: UserId };
}): Result<string, SharedModel> => {
  return Ok(input.model);
};
