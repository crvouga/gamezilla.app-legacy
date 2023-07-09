import { ClientAppMsg, Ctx, SpaceCtx, ViewCtx } from "@gamezilla/shared/client";
import { Cmd, Posix } from "@gamezilla/shared/core";
import {
  ClientModel,
  ClientMsg,
  ServerModel,
  ToClient,
  ToServer,
  handle,
  initSharedModel,
} from "./vs-bot.shared";

//
//
//
// Model
//
//
//

export type Model = ClientModel;

export const init = initSharedModel;

//
//
//
// Update
//
//
//

export type Msg = ClientMsg;

export const update = ({
  msg,
  model,
  ctx,
  sendToServer,
}: {
  sendToServer: (msg: ToServer) => Cmd;
  ctx: SpaceCtx;
  msg: Msg;
  model: Model;
}): {
  model: Model;
  msgs?: ClientAppMsg[];
  cmd?: Cmd<Msg>;
} => {
  const handled = handle({ ctx, msg, model });
  if (handled.t === "err") {
    return { model, cmd: sendToServer(msg) };
  }
  const merged = syncWithServer({
    ...ctx,
    client: model,
    server: handled.value,
  });
  return { model: merged, cmd: sendToServer(msg) };
};

export const updateFromServer = ({
  msg,
  model,
  ctx,
}: {
  ctx: Ctx;
  msg: ToClient;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
  msgs?: ClientAppMsg[];
} => {
  if (msg.result.t === "err") {
    return {
      model,
    };
  }

  const modelNew = syncWithServer({
    ...ctx,
    client: model,
    server: msg.result.value,
  });

  return {
    model: modelNew,
  };
};

export const syncWithServer = ({
  server,
  client,
}: {
  now: Posix;
  client: ClientModel;
  server: ServerModel;
}): ClientModel => {
  return {
    ...client,
    ...server,
  };
};

//
//
//
// View
//
//
//

export const View = ({
  goBack,
}: {
  ctx: ViewCtx;
  goBack: () => void;
  model: Model;
  $send: (msg: Msg) => void;
}) => {
  return <div onClick={goBack}></div>;
};

export const ViewMsg = ({ msg }: { msg: Msg | ToClient }) => {
  if ("result" in msg && msg.result.t === "err") {
    return msg.result.error;
  }
  return null;
};
