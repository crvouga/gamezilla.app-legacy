import {
  ServerCmd,
  ServerCtx,
  ServerEvt,
} from "gamezilla/@CHILD/app/@SHARED/server";
import {
  Eff,
  Posix,
  Result,
  Sub,
  batchMsgs,
  err,
  isErr,
  ok,
  toMsgType,
} from "gamezilla/@SHARED/core";
import { toSessionId } from "./@CHILD/auth/auth.core";
import * as AuthServer from "./@CHILD/auth/auth.server";
import * as ProfileServer from "./@CHILD/profile/profile.server";
import * as SpaceServer from "./@CHILD/space/space.server";
import { ServerTransport } from "./@CHILD/wire/transport-server";
import * as WireServer from "./@CHILD/wire/wire.server";
import { Logger, LoggerConsole } from "./@SHARED/server/logger";
import { createDbConn } from "./app-server/db-conn-sql";
import { createSMS } from "./app-server/sms";
import {
  APP_CONFIG,
  ServerModel,
  ServerMsg,
  ToClient,
  ToServer,
  ToServerMeta,
} from "./app.core";

//
//
//
//
//
//
//

const transport = ServerTransport<ToServer, ToClient>({
  impl: {
    t: "bun-web-sockets",
    serverPort: APP_CONFIG.SERVER_PORT,
    endpoint: APP_CONFIG.WEB_SOCKETS_ENDPOINT,
  },
});

//
//
//
// Model
//
//
//

export const init = async ({
  ctx,
}: {
  ctx: ServerCtx;
}): Promise<{
  model: ServerModel;
  eff?: Eff<ServerMsg>;
}> => {
  const wire = await WireServer.init();

  const space = await SpaceServer.init({
    ctx,
    stored: null,
  });

  const auth = await AuthServer.init({
    ctx,
    stored: null,
  });

  const profile = await ProfileServer.init({
    ctx,
    stored: null,
  });

  ctx.logger.info(`app config:\n${JSON.stringify(APP_CONFIG, null, 4)}`);

  return {
    model: {
      wire: wire.model,
      space: space.model,
      profile: profile.model,
      auth: auth.model,
    },
  };
};

//
//
//
// Update
//
//
//

export const update = async (input: {
  msg: ServerMsg;
  model: ServerModel;
  ctx: ServerCtx;
}): Promise<{
  model: ServerModel;
  eff?: Eff<ServerMsg>;
}> => {
  logMsg({ msg: input.msg, logger: input.ctx.logger });

  const updatedFromMsg = await updateChild({
    ctx: input.ctx,
    model: input.model,
    msg: input.msg,
    fromClient: input.msg.t === "➡️" ? { ...input.msg, ...input.msg.c } : null,
  });

  const updated = await updateLoop(input.ctx, updatedFromMsg);

  return {
    model: updated.model,
    eff: updated.eff,
  };
};

function logMsg({
  msg,
  evt,
  cmd,
  logger,
}: {
  logger: Logger;
  msg?: ServerMsg;
  evt?: ServerEvt;
  cmd?: ServerCmd<ToClient>;
}) {
  const prefix = msg ? "[msg]" : evt ? "[evt]" : "[cmd]";

  const obj = { ...msg, ...evt, ...cmd };

  logger.info(`${prefix} ${toMsgType(obj)}`);
}

type Output = {
  model: ServerModel;
  eff: Eff<ServerMsg>;
  evt: ServerEvt[];
  cmd: ServerCmd<ToClient>[];
};

const updateLoop = async (ctx: ServerCtx, acc: Output): Promise<Output> => {
  const [cmd, ...cmdRest] = acc.cmd;

  if (cmd) {
    const updatedCmd = await updateChild({ ctx, model: acc.model, cmd });

    const accNew: Output = {
      model: updatedCmd.model,
      cmd: [...cmdRest, ...updatedCmd.cmd],
      eff: Eff.batch([acc.eff, updatedCmd.eff]),
      evt: batchMsgs(acc.evt, updatedCmd.evt),
    };

    return updateLoop(ctx, accNew);
  }

  const [evt, ...evtRest] = acc.evt;

  if (evt) {
    const updatedEvt = await updateChild({ ctx, model: acc.model, evt });

    const accNew: Output = {
      model: updatedEvt.model,
      cmd: [...cmdRest, ...updatedEvt.cmd],
      eff: Eff.batch([acc.eff, updatedEvt.eff]),
      evt: batchMsgs(evtRest, updatedEvt.evt),
    };

    return updateLoop(ctx, accNew);
  }

  return acc;
};

export const updateChild = async ({
  ctx,
  msg,
  fromClient,
  evt,
  cmd,
  model,
}: {
  ctx: ServerCtx;
  model: ServerModel;
  msg?: ServerMsg;
  fromClient?: (ToServer & ToServerMeta) | null;
  evt?: ServerEvt;
  cmd?: ServerCmd<ToClient>;
}): Promise<Output> => {
  //
  //
  //
  //
  //

  const space = await SpaceServer.update({
    model: model.space,
    ctx,
    cmd: null,
    evt: evt,
    fromClient:
      fromClient?.t === "space" ? { ...fromClient, ...fromClient.c } : null,
    msg: msg?.t === "space" ? msg.c : null,
  });

  const auth = await AuthServer.update({
    model: model.auth,
    ctx,
    cmd: null,
    evt: evt,
    fromClient:
      fromClient?.t === "auth" ? { ...fromClient, ...fromClient.c } : null,
    msg: msg?.t === "auth" ? msg.c : null,
  });

  const wire = await WireServer.update({
    model: model.wire,
    ctx,
    cmd: cmd,
    evt: evt,
    fromClient:
      fromClient?.t === "wire" ? { ...fromClient, ...fromClient.c } : null,
    msg: msg?.t === "wire" ? msg.c : null,
    toSessionId: (userId) => toSessionId(ctx, model.auth, userId),
    transport,
  });

  const profile = await ProfileServer.update({
    model: model.profile,
    ctx,
    cmd: null,
    evt: evt,
    fromClient:
      fromClient?.t === "profile" ? { ...fromClient, ...fromClient.c } : null,
    msg: msg?.t === "profile" ? msg.c : null,
  });

  //
  //
  //
  //

  return {
    model: {
      auth: auth.model,
      profile: profile.model,
      space: space.model,
      wire: wire.model,
    },
    cmd: batchMsgs<ServerCmd<ToClient>>(
      ServerCmd.tag("space", space.cmd),
      ServerCmd.tag("auth", auth.cmd),
      ServerCmd.tag("wire", wire.cmd),
      ServerCmd.tag("profile", profile.cmd)
    ),
    eff: Eff.batch<ServerMsg>([
      Eff.t("space", space.eff),
      Eff.t("auth", auth.eff),
      Eff.t("wire", wire.eff),
      Eff.t("profile", profile.eff),
    ]),
    evt: batchMsgs<ServerEvt>(auth.evt, space.evt, wire.evt, profile.evt),
  };
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions = async ({
  model,
  ctx,
}: {
  model: ServerModel;
  ctx: ServerCtx;
}): Promise<Sub<ServerMsg>> => {
  return Sub.batch([
    Sub.tag(
      "space",
      await SpaceServer.subscriptions({ model: model.space, ctx })
    ),
    Sub.tag("wire", WireServer.subscriptions({ transport })),

    Sub.flat(
      Sub.map(transport.toServer, ({ sessionId, clientId, msgs }) =>
        msgs.map(
          (msg: any): ServerMsg => ({
            t: "➡️",
            sessionId,
            clientId,
            c: msg,
          })
        )
      )
    ),
  ]);
};

//
//
//
//
//
//

export const createCtx = async (): Promise<Result<string, ServerCtx>> => {
  const logger = LoggerConsole("app");

  const databaseUrl =
    process.env.NODE_ENV === "production"
      ? process.env["DATABASE_URL_PROD"]
      : process.env["DATABASE_URL"];

  if (!databaseUrl) {
    return err("databaseUrl not found in env vars");
  }

  const created = await createDbConn({ databaseUrl, logger });

  if (isErr(created)) {
    return created;
  }

  const dbConn = created.value;

  const sms = createSMS("twilio");

  return ok({
    sms,
    logger,
    dbConn,
    now: Posix.now$(),
  });
};
