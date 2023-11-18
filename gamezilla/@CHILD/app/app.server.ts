import {
  AnonymousReqCtx,
  ReqCtx,
  ServerCmd,
  ServerCtx,
  ServerEvt,
  sendBack,
} from "gamezilla/@CHILD/app/@SHARED/server";
import {
  Eff,
  Posix,
  Result,
  Sub,
  err,
  ok,
  p,
  toMsgPayload,
  toMsgType,
} from "gamezilla/@SHARED/core";
import * as AuthServer from "./@CHILD/auth/auth.server";
import * as ChatServer from "./@CHILD/chat/chat.server";
import * as ProfileServer from "./@CHILD/profile/profile.server";
import * as SearchServer from "./@CHILD/search/search.server";
import * as SpaceServer from "./@CHILD/space/space.server";
import * as WireServer from "./@CHILD/wire/wire.server";
import { LoggerConsole } from "./@SHARED/server/logger";
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

const { toClient, toClientBroadcast, toServer } = WireServer.createTransport<
  ToServer,
  ToClient
>();

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
  return {
    model: {
      wire: wire.model,
      space: space.model,
      profile: ProfileServer.init,
      search: SearchServer.init.model,
      chat: ChatServer.init.model,
      auth: AuthServer.init,
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
  input.ctx.logger.info(
    `[msg] ${toMsgType(input.msg)} ${JSON.stringify(toMsgPayload(input.msg))}`
  );

  const updated = await updateMain(input);

  let acc = updated;

  let iterations = 0;
  while (true) {
    iterations++;
    if (iterations > 100) {
      input.ctx.logger.error("update loop exceeded 100 iterations");
      break;
    }

    if ((acc.evt?.length ?? 0) === 0 && (acc.cmd?.length ?? 0) === 0) {
      break;
    }

    for (const evt of acc.evt ?? []) {
      input.ctx.logger.info(
        `[evt] ${toMsgType(evt)} ${JSON.stringify(toMsgPayload(evt))}`
      );
      const updatedEvt = await updateFromEvent({
        ...input,
        model: acc.model,
        msg: evt,
      });
      acc = {
        model: updatedEvt.model,
        eff: Eff.batch([acc.eff, updatedEvt.eff]),
        cmd: updatedEvt.cmd,
        evt: updatedEvt.evt,
      };
    }

    for (const cmd of acc.cmd ?? []) {
      input.ctx.logger.info(
        `[cmd] ${toMsgType(cmd)} ${JSON.stringify(toMsgPayload(cmd))}`
      );
      const updatedCmd = updateFromCmd({
        ...input,
        model: acc.model,
        cmd,
      });
      acc = {
        model: updatedCmd.model,
        eff: Eff.batch([acc.eff, updatedCmd.eff]),
        cmd: updatedCmd.cmd ?? [],
        evt: updatedCmd.evt,
      };
    }
  }

  return acc;
};

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
      });
      return {
        model: { ...model, wire: updated.model },
        evt: updated.evt,
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
  const currentUserId = model.auth.usersBySessionId[ctx.sessionId]?.userId;
  const authReqCtx: ReqCtx | null = currentUserId
    ? {
        ...ctx,
        currentUserId,
      }
    : null;
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
      if (!authReqCtx) {
        return { model };
      }

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
      if (!authReqCtx) {
        return { model };
      }

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
    case "wire/send-to-user":
    case "wire/broadcast":
    case "wire/send-to-client": {
      const updated = WireServer.updateFromCmd({
        usersBySessionId: model.auth.usersBySessionId,
        cmd,
        model: model.wire,
        toClient: toClient,
        toClientBroadcast: toClientBroadcast,
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
    Sub.tag("wire", WireServer.subscriptions),

    Sub.flat(
      Sub.map(toServer, ({ sessionId, clientId, msgs }) =>
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

  const created = await createDbConn({ databaseUrl });

  if (created.t === "err") {
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
