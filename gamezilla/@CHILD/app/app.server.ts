import {
  AnonymousReqCtx,
  ReqCtx,
  ServerCmd,
  ServerCtx,
  ServerEvt,
} from "gamezilla/@CHILD/app/@SHARED/server";
import {
  Eff,
  Posix,
  Result,
  Sub,
  err,
  isErr,
  ok,
  toMsgType,
} from "gamezilla/@SHARED/core";
import * as AuthServer from "./@CHILD/auth/auth.server";
import * as ChatServer from "./@CHILD/chat/chat.server";
import * as ProfileServer from "./@CHILD/profile/profile.server";
import * as SearchServer from "./@CHILD/search/search.server";
import * as SpaceServer from "./@CHILD/space/space.server";
import { ServerTransport } from "./@CHILD/wire/transport-server";
import * as WireServer from "./@CHILD/wire/wire.server";
import { Logger, LoggerConsole } from "./@SHARED/server/logger";
import { createDbConn } from "./app-server/db-conn-sql";
import { createSMS } from "./app-server/sms";
import { ServerModel, ServerMsg, ToClient, ToServer } from "./app.core";

//
//
//
//
//
//
//

const transport = ServerTransport<ToServer, ToClient>({
  impl: "bun-web-sockets",
});

//
//
//
// Model
//
//
//

export const init = ({
  ctx,
}: {
  ctx: ServerCtx;
}): {
  model: ServerModel;
  eff?: Eff<ServerMsg>;
} => {
  const wire = WireServer.init();
  const space = SpaceServer.init();
  const auth = AuthServer.init();
  return {
    model: {
      wire: wire.model,
      space: space.model,
      profile: ProfileServer.init,
      search: SearchServer.init.model,
      chat: ChatServer.init.model,
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

  let acc = await updateMain(input);

  let iterations = 0;
  while (true) {
    iterations++;
    if (iterations > 100) {
      input.ctx.logger.error("update loop exceeded 100 iterations");
      break;
    }

    let newEvents: ServerEvt[] = [];
    let newCommands: ServerCmd<ToClient>[] = [];

    // Process events
    for (const evt of acc.evt ?? []) {
      logMsg({ evt, logger: input.ctx.logger });
      const updatedEvt = await updateFromEvent({
        ...input,
        model: acc.model,
        msg: evt,
      });
      acc.model = updatedEvt.model;
      newEvents = newEvents.concat(updatedEvt.evt ?? []);
      newCommands = newCommands.concat(updatedEvt.cmd ?? []);
      acc.eff = Eff.batch([acc.eff, updatedEvt.eff]);
    }

    // Process commands
    for (const cmd of acc.cmd ?? []) {
      logMsg({ cmd, logger: input.ctx.logger });
      const updatedCmd = await updateFromCmd({
        ...input,
        model: acc.model,
        cmd,
      });
      acc.model = updatedCmd.model;
      newEvents = newEvents.concat(updatedCmd.evt ?? []);
      newCommands = newCommands.concat(updatedCmd.cmd ?? []);
      acc.eff = Eff.batch([acc.eff, updatedCmd.eff]);
    }

    if (newEvents.length === 0 && newCommands.length === 0) {
      break;
    }

    acc.evt = newEvents;
    acc.cmd = newCommands;
  }

  return acc;
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

const updateMain = async ({
  msg,
  model,
  ctx,
}: {
  msg: ServerMsg;
  model: ServerModel;
  ctx: ServerCtx;
}): Promise<{
  model: ServerModel;
  eff?: Eff<ServerMsg>;
  evt?: ServerEvt[];
  cmd?: ServerCmd<ToClient>[];
}> => {
  switch (msg.t) {
    case "➡️": {
      return updateFromClient({
        ctx: {
          ...ctx,
          sessionId: msg.sessionId,
          clientId: msg.clientId,
        },
        msg: msg.c,
        model,
      });
    }

    case "wire": {
      const updated = WireServer.update({
        model: model.wire,
        msg: msg.c,
        ctx,
      });

      return {
        model: { ...model, wire: updated.model },
        evt: updated.evt,
        cmd: ServerCmd.tag("wire", updated.cmd),
      };
    }

    case "space": {
      const updated = await SpaceServer.update({
        msg: msg.c,
        model: model.space,
        ctx,
      });

      return {
        model: { ...model, space: updated.model },
        eff: Eff.t("space", updated.eff ?? Eff.None),
        cmd: ServerCmd.tag("space", updated.cmd),
      };
    }

    case "profile": {
      const updated = ProfileServer.update({
        model: model.profile,
        msg: msg.c,
      });
      return {
        model: { ...model, profile: updated.model },
        cmd: ServerCmd.tag("profile", updated.cmd),
      };
    }

    case "search": {
      const updated = SearchServer.update({
        model: model.search,
        msg: msg.c,
      });
      return {
        model: { ...model, search: updated.model },
        eff: Eff.t("search", updated.eff),
      };
    }

    case "auth": {
      const updated = AuthServer.update({ ctx, model: model.auth, msg: msg.c });
      return {
        model: { ...model, auth: updated.model },
        cmd: ServerCmd.tag("auth", updated.cmd),
        eff: Eff.t("auth", updated.eff),
        evt: updated.evt,
      };
    }

    case "chat": {
      const updated = ChatServer.update({
        model: model.chat,
        msg: msg.c,
      });

      return {
        model: { ...model, chat: updated.model },
        eff: Eff.t("chat", updated.eff),
      };
    }
  }
};

const updateFromClient = async ({
  msg,
  model,
  ctx,
}: {
  ctx: AnonymousReqCtx;
  msg: ToServer;
  model: ServerModel;
}): Promise<{
  model: ServerModel;
  eff?: Eff<ServerMsg>;
  cmd?: ServerCmd<ToClient>[];
  evt?: ServerEvt[];
}> => {
  const currentUserId = model.auth.userIdBySessionId[ctx.sessionId];
  const authReqCtx: ReqCtx | AnonymousReqCtx = currentUserId
    ? {
        ...ctx,
        currentUserId,
      }
    : ctx;
  switch (msg.t) {
    case "auth": {
      const updated = AuthServer.updateFromClient({
        ctx,
        model: model.auth,
        msg: msg.c,
      });
      return {
        model: { ...model, auth: updated.model },
        cmd: ServerCmd.tag("auth", updated.cmd),
        evt: updated.evt,
        eff: Eff.t("auth", updated.eff),
      };
    }

    case "profile": {
      const updated = ProfileServer.updateFromClient({
        model: model.profile,
        msg: msg.c,
        ctx: authReqCtx,
      });

      return {
        model: { ...model, profile: updated.model },
        eff: Eff.t("profile", updated.eff),
      };
    }

    case "search": {
      const updated = SearchServer.updateFromClient({
        model: model.search,
        msg: msg.c,
      });
      return {
        model: { ...model, search: updated.model },
        eff: Eff.t("search", updated.eff),
      };
    }

    case "chat": {
      const updated = ChatServer.updateFromClient({
        model: model.chat,
        msg: msg.c,
      });
      return {
        model: { ...model, chat: updated.model },
        eff: Eff.t("chat", updated.eff),
      };
    }

    case "space": {
      const updated = await SpaceServer.updateFromClient({
        ctx: authReqCtx,
        msg: msg.c,
        model: model.space,
      });

      return {
        model: {
          ...model,
          space: updated.model,
        },
        eff: Eff.t("space", updated.eff),
        cmd: ServerCmd.tag("space", updated.cmd),
      };
    }

    case "wire": {
      const updated = WireServer.updateFromClient({
        model: model.wire,
        msg: msg.c,
      });
      return {
        model: { ...model, wire: updated.model },
      };
    }
  }
};

const updateFromEvent = async ({
  ctx,
  msg,
  model,
}: {
  ctx: ServerCtx;
  msg: ServerEvt;
  model: ServerModel;
}): Promise<{
  model: ServerModel;
  eff?: Eff<ServerMsg>;
  cmd?: ServerCmd<ToClient>[];
  evt?: ServerEvt[];
}> => {
  const space = await SpaceServer.updateFromEvent({
    ctx,
    msg,
    model: model.space,
  });

  const profile = ProfileServer.updateFromEvent({
    ctx,
    msg,
    model: model.profile,
  });

  const auth = AuthServer.updateFromEvent({
    msg,
    model: model.auth,
  });

  return {
    model: {
      ...model,
      space: space.model,
      profile: profile.model,
      auth: auth.model,
    },
    eff: Eff.batch<ServerMsg>([
      Eff.t("space", space.eff),
      Eff.t("profile", profile.eff),
    ]),
    cmd: [
      ...(ServerCmd.tag("space", space.cmd) ?? []),
      ...(ServerCmd.tag("auth", auth.cmd) ?? []),
    ],
    evt: [...(auth.evt ?? [])],
  };
};

const updateFromCmd = ({
  cmd,
  model,
}: {
  cmd: ServerCmd<ToClient>;
  model: ServerModel;
  ctx: ServerCtx;
}): {
  model: ServerModel;
  eff?: Eff<ServerMsg>;
  evt?: ServerEvt[];
  cmd?: ServerCmd<ToClient>[];
} => {
  switch (cmd.t) {
    case "wire/topic-publish":
    case "wire/topic-subscribe":
    case "wire/send-to-user":
    case "wire/broadcast":
    case "wire/send-to-client": {
      const updated = WireServer.updateFromCmd<ToServer, ToClient>({
        cmd,
        model: model.wire,
        transport,
        sessionIdByUserId: model.auth.sessionIdByUserId,
      });
      return {
        model: {
          ...model,
          wire: updated.model,
        },
        eff: Eff.t("wire", updated.eff),
      };
    }
  }
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
    now: Posix.now(),
  });
};
