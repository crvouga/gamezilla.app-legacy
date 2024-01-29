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
import { Logger, LoggerConsole } from "./@SHARED/server/logger";
import { createDbConn } from "./app-server/db-conn-sql";
import { createSMS } from "./app-server/sms";
import {
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

export type Deps = {
  logger: Logger;
  dbConn: DbConnSql;
  sms: SMS;
  transport: IServerTransport<{
    ToClient: ToClient;
    ToServer: ToServer;
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

  const transport = ServerTransport<ToServer, ToClient>({
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
  model: ServerModel;
  eff?: Eff<ServerMsg>;
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
  msg: ServerMsg;
  model: ServerModel;
  ctx: { now: Posix };
  deps: Deps;
}): Promise<{
  model: ServerModel;
  eff?: Eff<ServerMsg>;
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
    fromClient: input.msg.t === "➡️" ? { ...input.msg, ...input.msg.c } : null,
  });

  const updated = await updateLoop(input.deps, ctx, updatedFromMsg);

  return {
    model: updated.model,
    eff: updated.eff,
  };
};

function logMsg({
  msg,
  msgEvent,
  msgCmd,
  logger,
}: {
  logger: Logger;
  msg?: ServerMsg;
  msgEvent?: ServerEvent;
  msgCmd?: ServerCmd<ToClient>;
}) {
  const prefix = msg ? "[msg]" : msgEvent ? "[msgEvent]" : "[msgCmd]";

  const obj = { ...msg, ...msgEvent, ...msgCmd };

  logger.info(`${prefix} ${toMsgType(obj)}`);
}

type Output = {
  model: ServerModel;
  eff: Eff<ServerMsg>;
  msgEvent: ServerEvent[];
  msgCmd: ServerCmd<ToClient>[];
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
      msgEvent: batchMsgs(acc.msgEvent, updatedCmd.msgEvent),
    };

    ctx.logger.info(`[msgCmd] ${toMsgType(msgCmd)}`);

    return updateLoop(deps, ctx, accNew);
  }

  const [msgEvent, ...msgEventRest] = acc.msgEvent;

  if (msgEvent) {
    const updatedEvent = await updateChild({
      deps,
      ctx,
      model: acc.model,
      msgEvent,
    });

    const accNew: Output = {
      model: updatedEvent.model,
      msgCmd: [...msgCmdRest, ...updatedEvent.msgCmd],
      eff: Eff.batch([acc.eff, updatedEvent.eff]),
      msgEvent: batchMsgs(msgEventRest, updatedEvent.msgEvent),
    };

    ctx.logger.info(`[evt] ${toMsgType(msgEvent)}`);

    return updateLoop(deps, ctx, accNew);
  }

  return acc;
};

export const updateChild = async ({
  ctx,
  msg,
  fromClient,
  msgEvent,
  msgCmd,
  model,
  deps,
}: {
  deps: Deps;
  ctx: ServerCtx;
  model: ServerModel;
  msg?: ServerMsg;
  fromClient?: (ToServer & ToServerMeta) | null;
  msgEvent?: ServerEvent;
  msgCmd?: ServerCmd<ToClient>;
}): Promise<Output> => {
  //
  //
  //
  //
  //

  const userId = fromClient?.sessionId
    ? await AuthServer.toUserIdFromSessionId(
        ctx,
        model.auth,
        fromClient.sessionId
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
    msgEvent: msgEvent,
    fromClient:
      fromClient?.t === "spaces"
        ? { ...fromClient, ...fromClient.c, userId }
        : null,
    msg: msg?.t === "spaces" ? msg.c : null,
  });

  const auth = await AuthServer.update({
    model: model.auth,
    ctx,
    msgCmd: null,
    msgEvent: msgEvent,
    fromClient:
      fromClient?.t === "auth"
        ? { ...fromClient, ...fromClient.c, userId }
        : null,
    msg: msg?.t === "auth" ? msg.c : null,
  });

  const wire = await WireServer.update({
    model: model.wire,
    ctx,
    msgCmd: msgCmd?.t === "wire" ? msgCmd : null,
    msgEvent: msgEvent,
    fromClient:
      fromClient?.t === "wire" ? { ...fromClient, ...fromClient.c } : null,
    msg: msg?.t === "wire" ? msg.c : null,
    transport: deps.transport,
  });

  const profile = await ProfileServer.update({
    model: model.profile,
    ctx,
    msgCmd: null,
    msgEvent: msgEvent,
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
      spaces: space.model,
      wire: wire.model,
    },
    msgCmd: batchMsgs<ServerCmd<ToClient>>(
      ServerCmd.tag("spaces", space.msgCmd),
      ServerCmd.tag("auth", auth.msgCmd),
      ServerCmd.tag("wire", wire.msgCmd),
      ServerCmd.tag("profile", profile.msgCmd)
    ),
    eff: Eff.batch<ServerMsg>([
      Eff.tag("spaces", space.eff),
      Eff.tag("auth", auth.eff),
      Eff.tag("wire", wire.eff),
      Eff.tag("profile", profile.eff),
    ]),
    msgEvent: batchMsgs<ServerEvent>(
      auth.msgEvent,
      space.msgEvent,
      wire.msgEvent,
      profile.msgEvent
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
  model: ServerModel;
  ctx: { now: Posix };
}): Promise<Sub<ServerMsg>> => {
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
