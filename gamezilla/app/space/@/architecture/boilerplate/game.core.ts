import { Ok, Result } from "gamezilla/core";
import { UserId } from "gamezilla/app/@/app";

//
//
//
// Model
//
//
//

export type CoreModel = {
  t: null;
};

export const initShared: CoreModel = {
  t: null,
};

export type ClientModel = CoreModel;

export type ServerModel = CoreModel;

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

export type Res = Req & { result: Result<string, CoreModel> };

export const handle = (input: {
  msg: Req;
  model: ServerModel;
  ctx: { currentUserId: UserId };
}): Result<string, CoreModel> => {
  return Ok(input.model);
};
