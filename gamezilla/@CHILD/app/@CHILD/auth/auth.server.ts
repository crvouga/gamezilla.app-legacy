import { AppServerModule } from "gamezilla/@CHILD/app/@SHARED/architecture/app-server";
import { SessionId, UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import {
  ServerCmd,
  ServerCtx,
  ServerEvent,
  sendToClient,
} from "gamezilla/@CHILD/app/@SHARED/server";
import { Eff, Sub, isErr } from "gamezilla/@SHARED/core";
import * as AuthServerSMS from "./@CHILD/auth-sms/auth-sms.server";
import {
  StoreSessionIdByUserId,
  StoreUserIdBySessionId,
} from "./@SHARED/server/auth-session-store";
import { ServerModel, ServerMsg, ToClient, ToServer } from "./auth.core";

//
//
//
//
//
//
//
//

type Module = AppServerModule<{
  Ctx: ServerCtx;
  InCmd: {};
  InEvent: ServerEvent;
  Model: ServerModel;
  Msg: ServerMsg;
  OutCmd: ServerCmd<ToClient>;
  OutEvent: ServerEvent;
  ToClient: ToClient;
  ToServer: ToServer;
}>;

//
//
//
// Model
//
//
//

export const init: Module["init"] = async (input) => {
  const { ctx } = input;
  const sms = await AuthServerSMS.init({ ...input, stored: null });

  return {
    model: {
      userIdBySessionId: StoreUserIdBySessionId(input.ctx).startingAt(ctx.now),
      sessionIdsByUserId: StoreSessionIdByUserId(input.ctx).startingAt(ctx.now),
      sms: sms.model,
    },
    eff: Eff.tag("sms", sms.eff),
    cmd: ServerCmd.tag("sms", sms.cmd),
    event: sms.event,
  };
};

//
//
//
// Update
//
//
//

export const update: Module["update"] = async (input) => {
  return AppServerModule.chainUpdates(
    { model: input.model },
    (model) => updateFromMsg({ ...input, model }),
    (model) => updateFromClient({ ...input, model }),
    (model) => updateFromEvent({ ...input, model }),
    (model) => updateChild({ ...input, model })
  );
};

const updateChild: Module["update"] = async (input) => {
  const sms = await AuthServerSMS.update({
    ctx: input.ctx,
    model: input.model.sms,
    cmd: input.cmd,
    event: input.event,
    fromClient:
      input.fromClient?.t === "sms"
        ? { ...input.fromClient, ...input.fromClient.c }
        : null,
    msg: input.msg?.t === "sms" ? input.msg.c : null,
  });

  return {
    model: {
      ...input.model,
      sms: sms.model,
    },
    eff: Eff.tag("sms", sms.eff),
    cmd: ServerCmd.tag("sms", sms.cmd),
    event: sms.event,
  };
};

const updateFromMsg: Module["update"] = async ({ ctx, model, msg }) => {
  if (!msg) {
    return { model };
  }

  switch (msg.t) {
    case "got-user-account": {
      if (isErr(msg.result)) {
        console.error(msg.result.error);
        return {
          model,
        };
      }

      const modelNew = await addSession(
        ctx,
        model,
        msg.sessionId,
        msg.result.value.userId
      );

      return {
        model: modelNew,
        event: [
          {
            t: "auth/connected-client-authenticated",
            clientId: msg.clientId,
            sessionId: msg.sessionId,
            userId: msg.result.value.userId,
            loggedIn: true,
          },
        ],
      };
    }

    case "sms": {
      return { model };
    }
  }
};

const updateFromClient: Module["update"] = async ({
  ctx,
  model,
  fromClient,
}) => {
  if (!fromClient) {
    return { model };
  }

  switch (fromClient.t) {
    case "logout": {
      const modelNew = await removeSession(ctx, model, fromClient.sessionId);

      return {
        model: modelNew,
        event: [
          {
            t: "connected-client-is-logged-out",
            clientId: fromClient.clientId,
            sessionId: fromClient.sessionId,
          },
        ],
      };
    }

    case "sms": {
      return { model };
    }
  }
};

const updateFromEvent: typeof update = async ({ event, model, ctx }) => {
  if (!event) {
    return { model };
  }

  switch (event.t) {
    case "wire/client-connected": {
      const userId = await StoreUserIdBySessionId(ctx).get(
        model.userIdBySessionId,
        event.sessionId
      );

      if (!userId) {
        return {
          model: model,
          event: [
            {
              t: "connected-client-is-logged-out",
              clientId: event.clientId,
              sessionId: event.sessionId,
            },
          ],
        };
      }

      return {
        model: model,
        event: [
          {
            ...event,
            t: "auth/connected-client-authenticated",
            userId,
          },
        ],
      };
    }

    case "auth/connected-client-authenticated": {
      return AppServerModule.chainUpdates(
        { model },
        async (model) => {
          if (event.loggedIn) {
            return {
              model: await addSession(
                ctx,
                model,
                event.sessionId,
                event.userId
              ),
            };
          }
          return { model };
        },
        async (model) => {
          return {
            model,
            cmd: [
              sendToClient([event.clientId], {
                t: "client-is-logged-in",
                userId: event.userId,
                sessionId: event.sessionId,
                loggedIn: true,
              }),
            ],
          };
        }
      );
    }

    case "connected-client-is-logged-out": {
      return {
        model: model,
        cmd: [
          sendToClient([event.clientId], {
            t: "client-is-logged-out",
            sessionId: event.sessionId,
          }),
        ],
      };
    }

    default: {
      return { model };
    }
  }
};

export const updateFromCmd = ({
  cmd,
  model,
}: {
  cmd: ServerCmd<ToClient>;
  model: ServerModel;
}): {
  model: ServerModel;
  event?: ServerEvent[];
} => {
  switch (cmd.t) {
    default: {
      return { model };
    }
  }
};

//
//
//
//
//
//
//
//

async function addSession(
  ctx: ServerCtx,
  model: ServerModel,
  sessionId: SessionId,
  userId: UserId
): Promise<ServerModel> {
  const userIdBySessionIdNew = await StoreUserIdBySessionId(ctx).assoc(
    ctx.now,
    model.userIdBySessionId,
    sessionId,
    userId
  );

  const sessionIds = await StoreSessionIdByUserId(ctx).get(
    model.sessionIdsByUserId,
    userId
  );

  const sessionIdsNew = {
    ...sessionIds,
    [sessionId]: sessionId,
  };

  const sessionIdByUserIdNew = await StoreSessionIdByUserId(ctx).assoc(
    ctx.now,
    model.sessionIdsByUserId,
    userId,
    sessionIdsNew
  );

  return {
    ...model,
    sessionIdsByUserId: sessionIdByUserIdNew,
    userIdBySessionId: userIdBySessionIdNew,
  };
}

async function removeSession(
  ctx: ServerCtx,
  model: ServerModel,
  sessionId: SessionId
): Promise<ServerModel> {
  const userIdBySessionIdNew = await StoreUserIdBySessionId(ctx).dissoc(
    ctx.now,
    model.userIdBySessionId,
    sessionId
  );

  const userId = await StoreUserIdBySessionId(ctx).get(
    model.userIdBySessionId,
    sessionId
  );

  if (!userId) {
    return {
      ...model,
      userIdBySessionId: userIdBySessionIdNew,
    };
  }

  const sessionIdByUserIdNew = await StoreSessionIdByUserId(ctx).dissoc(
    ctx.now,
    model.sessionIdsByUserId,
    userId
  );

  return {
    ...model,
    sessionIdsByUserId: sessionIdByUserIdNew,
    userIdBySessionId: userIdBySessionIdNew,
  };
}

//
//
//
//
//
//
//
//

export const subscriptions: Module["subscriptions"] = async (input) => {
  return Sub.batch([
    Sub.tag(
      "sms",
      await AuthServerSMS.subscriptions({ ...input, model: input.model.sms })
    ),
  ]);
};
