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
import { toSessionId } from "./@CHILD/auth/auth.core";
import * as AuthServer from "./@CHILD/auth/auth.server";
import * as ProfileServer from "./@CHILD/profile/profile.server";
import * as SpaceServer from "./@CHILD/space/space.server";
import {
  IServerTransport,
  ServerTransport,
} from "./@CHILD/wire/transport-server";
import * as WireServer from "./@CHILD/wire/wire.server";
import { Logger, LoggerConsole } from "./@SHARED/server/logger";
import { createDbConn } from "./app-server/db-conn-sql";
import { createSMS } from "./app-server/sms";
import {
  PUBLIC_APP_CONFIG,
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

  const transport = ServerTransport<ToServer, ToClient>({
    codebaseVersionId: PUBLIC_APP_CONFIG.CODEBASE_VERSION_ID,
    impl: {
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
  event,
  cmd,
  logger,
}: {
  logger: Logger;
  msg?: ServerMsg;
  event?: ServerEvent;
  cmd?: ServerCmd<ToClient>;
}) {
  const prefix = msg ? "[msg]" : event ? "[event]" : "[cmd]";

  const obj = { ...msg, ...event, ...cmd };

  logger.info(`${prefix} ${toMsgType(obj)}`);
}

type Output = {
  model: ServerModel;
  eff: Eff<ServerMsg>;
  event: ServerEvent[];
  cmd: ServerCmd<ToClient>[];
};

const updateLoop = async (
  deps: Deps,
  ctx: ServerCtx,
  acc: Output
): Promise<Output> => {
  const [cmd, ...cmdRest] = acc.cmd;

  if (cmd) {
    const updatedCmd = await updateChild({ deps, ctx, model: acc.model, cmd });

    const accNew: Output = {
      model: updatedCmd.model,
      cmd: [...cmdRest, ...updatedCmd.cmd],
      eff: Eff.batch([acc.eff, updatedCmd.eff]),
      event: batchMsgs(acc.event, updatedCmd.event),
    };

    ctx.logger.info(`[cmd] ${toMsgType(cmd)}`);

    return updateLoop(deps, ctx, accNew);
  }

  const [event, ...eventRest] = acc.event;

  if (event) {
    const updatedEvent = await updateChild({
      deps,
      ctx,
      model: acc.model,
      event,
    });

    const accNew: Output = {
      model: updatedEvent.model,
      cmd: [...cmdRest, ...updatedEvent.cmd],
      eff: Eff.batch([acc.eff, updatedEvent.eff]),
      event: batchMsgs(eventRest, updatedEvent.event),
    };

    ctx.logger.info(`[evt] ${toMsgType(event)}`);

    return updateLoop(deps, ctx, accNew);
  }

  return acc;
};

export const updateChild = async ({
  ctx,
  msg,
  fromClient,
  event,
  cmd,
  model,
  deps,
}: {
  deps: Deps;
  ctx: ServerCtx;
  model: ServerModel;
  msg?: ServerMsg;
  fromClient?: (ToServer & ToServerMeta) | null;
  event?: ServerEvent;
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
    event: event,
    fromClient:
      fromClient?.t === "space" ? { ...fromClient, ...fromClient.c } : null,
    msg: msg?.t === "space" ? msg.c : null,
  });

  const auth = await AuthServer.update({
    model: model.auth,
    ctx,
    cmd: null,
    event: event,
    fromClient:
      fromClient?.t === "auth" ? { ...fromClient, ...fromClient.c } : null,
    msg: msg?.t === "auth" ? msg.c : null,
  });

  const wire = await WireServer.update({
    model: model.wire,
    ctx,
    cmd: cmd,
    event: event,
    fromClient:
      fromClient?.t === "wire" ? { ...fromClient, ...fromClient.c } : null,
    msg: msg?.t === "wire" ? msg.c : null,
    toSessionId: (userId) => toSessionId(ctx, model.auth, userId),
    transport: deps.transport,
  });

  const profile = await ProfileServer.update({
    model: model.profile,
    ctx,
    cmd: null,
    event: event,
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
      Eff.tag("space", space.eff),
      Eff.tag("auth", auth.eff),
      Eff.tag("wire", wire.eff),
      Eff.tag("profile", profile.eff),
    ]),
    event: batchMsgs<ServerEvent>(
      auth.event,
      space.event,
      wire.event,
      profile.event
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
      "space",
      await SpaceServer.subscriptions({ model: input.model.space, ctx })
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
