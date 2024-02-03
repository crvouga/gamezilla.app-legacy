import { PUBLIC_APP_CONFIG } from "config.ts";
import {
  DbConnSql,
  SMS,
  ServerCmd,
  ServerCtx,
  ServerEvent,
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
import * as AuthServer from "./@CHILD/auth/auth.server";
import * as ProfileServer from "./@CHILD/profile/profile.server";
import * as SpaceServer from "./@CHILD/spaces/spaces.server";
import {
  IServerTransport,
  ServerTransport,
} from "./@CHILD/wire/transport-server";
import * as WireServer from "./@CHILD/wire/wire.server";
import { createDbConn } from "./@SHARED/server/db-conn-sql";
import { Logger, LoggerConsole } from "./@SHARED/server/logger";
import { createSMS } from "./@SHARED/server/sms";
import {
  ModelServer,
  MsgServer,
  MsgToClient,
  MsgToServer,
  MsgToServerMeta,
} from "./app.core";

//
//
//
//
//
//
//

export type Deps = {
  logger: Logger;
  dbConn: DbConnSql;
  sms: SMS;
  transport: IServerTransport<{
    MsgToClient: MsgToClient;
    MsgToServer: MsgToServer;
  }>;
};

export const getDeps = async (): Promise<Result<string, Deps>> => {
  const logger = LoggerConsole("app");

  const databaseUrl =
    process.env["NODE_ENV"] === "production"
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

  const transport = ServerTransport<MsgToServer, MsgToClient>({
    codebaseVersionId: PUBLIC_APP_CONFIG.CODEBASE_VERSION_ID,
    impl:
      PUBLIC_APP_CONFIG.TRANSPORT_IMPL === "socket-io"
        ? {
            t: "socket-io",
            serverPort: PUBLIC_APP_CONFIG.SERVER_PORT,
          }
        : {
            t: "bun-web-sockets",
            serverPort: PUBLIC_APP_CONFIG.SERVER_PORT,
            endpoint: PUBLIC_APP_CONFIG.WEB_SOCKETS_ENDPOINT,
          },
  });

  return ok({
    transport,
    sms,
    logger,
    dbConn,
  });
};

//
//
//
// Model
//
//
//

export const init = async (input: {
  ctx: { now: Posix };
  deps: Deps;
}): Promise<{
  model: ModelServer;
  eff?: Eff<MsgServer>;
}> => {
  const ctx: ServerCtx = {
    dbConn: input.deps.dbConn,
    logger: input.deps.logger,
    now: input.ctx.now,
  };

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

  return {
    model: {
      wire: wire.model,
      spaces: space.model,
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
  msg: MsgServer;
  model: ModelServer;
  ctx: { now: Posix };
  deps: Deps;
}): Promise<{
  model: ModelServer;
  eff?: Eff<MsgServer>;
}> => {
  logMsg({ msg: input.msg, logger: input.deps.logger });

  const ctx: ServerCtx = {
    dbConn: input.deps.dbConn,
    logger: input.deps.logger,
    now: input.ctx.now,
  };

  const updatedFromMsg = await updateChild({
    deps: input.deps,
    ctx: ctx,
    model: input.model,
    msg: input.msg,
    msgClient: input.msg.t === "➡️" ? { ...input.msg, ...input.msg.c } : null,
  });

  const updated = await updateLoop(input.deps, ctx, updatedFromMsg);

  return {
    model: updated.model,
    eff: updated.eff,
  };
};

function logMsg({
  msg,
  msgEvt,
  msgCmd,
  logger,
}: {
  logger: Logger;
  msg?: MsgServer;
  msgEvt?: ServerEvent;
  msgCmd?: ServerCmd<MsgToClient>;
}) {
  const prefix = msg ? "[msg]" : msgEvt ? "[msgEvt]" : "[msgCmd]";

  const obj = { ...msg, ...msgEvt, ...msgCmd };

  logger.info(`${prefix} ${toMsgType(obj)}`);
}

type Output = {
  model: ModelServer;
  eff: Eff<MsgServer>;
  msgEvt: ServerEvent[];
  msgCmd: ServerCmd<MsgToClient>[];
};

const updateLoop = async (
  deps: Deps,
  ctx: ServerCtx,
  acc: Output
): Promise<Output> => {
  const [msgCmd, ...msgCmdRest] = acc.msgCmd;

  if (msgCmd) {
    const updatedCmd = await updateChild({
      deps,
      ctx,
      model: acc.model,
      msgCmd,
    });

    const accNew: Output = {
      model: updatedCmd.model,
      msgCmd: [...msgCmdRest, ...updatedCmd.msgCmd],
      eff: Eff.batch([acc.eff, updatedCmd.eff]),
      msgEvt: batchMsgs(acc.msgEvt, updatedCmd.msgEvt),
    };

    ctx.logger.info(`[msgCmd] ${toMsgType(msgCmd)}`);

    return updateLoop(deps, ctx, accNew);
  }

  const [msgEvt, ...msgEvtRest] = acc.msgEvt;

  if (msgEvt) {
    const updatedEvent = await updateChild({
      deps,
      ctx,
      model: acc.model,
      msgEvt,
    });

    const accNew: Output = {
      model: updatedEvent.model,
      msgCmd: [...msgCmdRest, ...updatedEvent.msgCmd],
      eff: Eff.batch([acc.eff, updatedEvent.eff]),
      msgEvt: batchMsgs(msgEvtRest, updatedEvent.msgEvt),
    };

    ctx.logger.info(`[evt] ${toMsgType(msgEvt)}`);

    return updateLoop(deps, ctx, accNew);
  }

  return acc;
};

export const updateChild = async ({
  ctx,
  msg,
  msgClient,
  msgEvt,
  msgCmd,
  model,
  deps,
}: {
  deps: Deps;
  ctx: ServerCtx;
  model: ModelServer;
  msg?: MsgServer;
  msgClient?: (MsgToServer & MsgToServerMeta) | null;
  msgEvt?: ServerEvent;
  msgCmd?: ServerCmd<MsgToClient>;
}): Promise<Output> => {
  //
  //
  //
  //
  //

  const userId = msgClient?.sessionId
    ? await AuthServer.toUserIdFromSessionId(
        ctx,
        model.auth,
        msgClient.sessionId
      )
    : null;

  //
  //
  //
  //
  //

  const space = await SpaceServer.update({
    model: model.spaces,
    ctx,
    msgCmd: null,
    msgEvt: msgEvt,
    msgClient:
      msgClient?.t === "spaces"
        ? { ...msgClient, ...msgClient.c, userId }
        : null,
    msg: msg?.t === "spaces" ? msg.c : null,
  });

  const auth = await AuthServer.update({
    model: model.auth,
    ctx,
    msgCmd: null,
    msgEvt: msgEvt,
    msgClient:
      msgClient?.t === "auth" ? { ...msgClient, ...msgClient.c, userId } : null,
    msg: msg?.t === "auth" ? msg.c : null,
  });

  const wire = await WireServer.update({
    model: model.wire,
    ctx,
    msgCmd: msgCmd?.t === "wire" ? msgCmd : null,
    msgEvt: msgEvt,
    msgClient:
      msgClient?.t === "wire" ? { ...msgClient, ...msgClient.c } : null,
    msg: msg?.t === "wire" ? msg.c : null,
    transport: deps.transport,
  });

  const profile = await ProfileServer.update({
    model: model.profile,
    ctx,
    msgCmd: null,
    msgEvt: msgEvt,
    msgClient:
      msgClient?.t === "profile" ? { ...msgClient, ...msgClient.c } : null,
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
      spaces: space.model,
      wire: wire.model,
    },
    msgCmd: batchMsgs<ServerCmd<MsgToClient>>(
      ServerCmd.tag("spaces", space.msgCmd),
      ServerCmd.tag("auth", auth.msgCmd),
      ServerCmd.tag("wire", wire.msgCmd),
      ServerCmd.tag("profile", profile.msgCmd)
    ),
    eff: Eff.batch<MsgServer>([
      Eff.tag("spaces", space.eff),
      Eff.tag("auth", auth.eff),
      Eff.tag("wire", wire.eff),
      Eff.tag("profile", profile.eff),
    ]),
    msgEvt: batchMsgs<ServerEvent>(
      auth.msgEvt,
      space.msgEvt,
      wire.msgEvt,
      profile.msgEvt
    ),
  };
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions = async (input: {
  deps: Deps;
  model: ModelServer;
  ctx: { now: Posix };
}): Promise<Sub<MsgServer>> => {
  const ctx: ServerCtx = {
    dbConn: input.deps.dbConn,
    logger: input.deps.logger,
    now: input.ctx.now,
  };
  return Sub.batch([
    Sub.tag(
      "spaces",
      await SpaceServer.subscriptions({ model: input.model.spaces, ctx })
    ),
    Sub.tag(
      "wire",
      WireServer.subscriptions({ transport: input.deps.transport })
    ),

    Sub.flat(
      Sub.map(input.deps.transport.toServer, ({ sessionId, clientId, msgs }) =>
        msgs.map(
          (msg: any): MsgServer => ({
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
