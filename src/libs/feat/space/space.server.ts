import { ClientId, SpaceId, UserId } from "@gamezilla/shared/app";
import {
  AppMsg,
  AuthenticatedRequestCtx,
  Ctx,
  SpaceCtx,
  SpaceRequestCtx,
} from "@gamezilla/shared/server";
import { andThen, Cmd, exhaustive, Ok, p, Sub } from "@gamezilla/shared/core";
import * as Game from "./game.server";
import {
  ServerModel,
  ServerMsg,
  handle,
  Res,
  ToServer,
  ToClient,
} from "./space.shared";

//
//
//
// Model
//
//
//

export type Model = ServerModel;

export const init: Model = {
  spaces: {},
  users: {},
  games: {},
  profiles: {},
};

//
//
//
// Update
//
//
//

export type Msg = ServerMsg;

export const update = ({
  model,
  msg,
  sendToUser,
  ctx,
}: {
  ctx: Ctx;
  sendToUser: (userIds: UserId[], msg: ToClient) => Cmd;
  msg: Msg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  switch (msg.t) {
    case "game": {
      const { spaceId } = msg;

      const game = model.games[spaceId];

      if (!game) {
        return { model };
      }

      const gameMsg = msg.c;

      const space = model.spaces[spaceId];

      if (!space) {
        return { model };
      }

      const spaceCtx: SpaceCtx = {
        ...ctx,
        hostId: space.hostId,
      };

      const updated = Game.update({
        broadcast: (m) =>
          sendToSpace({ sendToUser, model, spaceId, msg: { t: "game", c: m } }),
        msg: gameMsg,
        model: game,
        ctx: spaceCtx,
      });

      const modelNew: Model = {
        ...model,
        games: {
          ...model.games,
          [spaceId]: updated[0],
        },
      };

      return {
        model: modelNew,
        cmd: p(
          updated[1],
          Cmd.map((m): Msg => ({ t: "game", spaceId, c: m }))
        ),
      };
    }
  }
};

type Wire = {
  sendToClient: (msg: ToClient) => Cmd;
  sendToUser: (userId: UserId[], msg: ToClient) => Cmd;
  broadcast: (msg: ToClient) => Cmd;
};

type updateFromClient = (input: {
  ctx: AuthenticatedRequestCtx;
  wire: Wire;
  msg: ToServer;
  model: Model;
}) => { model: Model; cmd?: Cmd<ServerMsg> };

export const updateFromClient: updateFromClient = (input) => {
  return p(
    input,
    andThen(({ model }) => updateProfiles({ ...input, model })),
    andThen(({ model }) => updateFromClient_({ ...input, model }))
  );
};

const updateProfiles: updateFromClient = ({ msg, model }) => {
  if (msg.profile) {
    return {
      model: {
        ...model,
        profiles: {
          ...model.profiles,
          [msg.profile.userId]: msg.profile,
        },
      },
    };
  }
  return { model };
};

export const updateFromClient_: updateFromClient = ({
  ctx,
  wire,
  msg,
  model,
}) => {
  switch (msg.t) {
    case "list":
    case "input-game":
    case "join":
    case "destroy":
    case "create": {
      const res: Res = { ...msg, result: handle({ ctx, model, msg }) };

      if (res.result.t === "err") {
        return { model, cmd: wire.sendToClient(res) };
      }

      return {
        model: res.result.value,
        cmd: wire.broadcast(res),
      };
    }

    case "leave": {
      return updateLeave({ ctx, wire, model, msg });
    }

    case "game": {
      const user = model.users[ctx.currentUserId];

      if (!user) {
        return { model };
      }

      const space = model.spaces[user.spaceId];

      if (!space) {
        return { model };
      }

      const game = model.games[user.spaceId];

      if (!game) {
        return { model };
      }

      const gameMsg = msg.c;

      const spaceCtx: SpaceRequestCtx = {
        ...ctx,
        hostId: space.hostId,
      };

      const [gameNew, gameCmd] = Game.updateFromClient({
        ...ctx,
        ctx: spaceCtx,
        sendToClient: (m) => wire.sendToClient({ t: "game", c: m }),
        broadcast: (m) =>
          sendToSpace({
            sendToUser: wire.sendToUser,
            model,
            spaceId: space.spaceId,
            msg: { t: "game", c: m },
          }),
        msg: gameMsg,
        model: game,
      });

      const modelNew: Model = {
        ...model,
        games: {
          ...model.games,
          [space.spaceId]: gameNew,
        },
      };

      return {
        model: modelNew,
        cmd: p(
          gameCmd,
          Cmd.map((msg): Msg => ({ t: "game", spaceId: space.spaceId, c: msg }))
        ),
      };
    }

    default:
      return exhaustive(msg[0]);
  }
};

const updateLeave = ({
  wire,
  model,
  msg,
  ctx,
}: {
  msg: ToServer;
  wire: Wire;
  model: Model;
  ctx: { currentUserId: UserId };
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.t !== "leave") {
    return { model };
  }

  const result = handle({ ctx, model, msg });
  const res: Res = { ...msg, result };

  if (result.t === "err") {
    return { model, cmd: wire.sendToClient(res) };
  }

  const modelAfter = result.value;

  const user = model.users[ctx.currentUserId];

  if (!user) {
    return { model: modelAfter, cmd: wire.broadcast(res) };
  }

  const space = model.spaces[user.spaceId];

  if (!space) {
    return { model: modelAfter, cmd: wire.broadcast(res) };
  }

  const game = model.games[space.spaceId];

  if (!game) {
    return { model: modelAfter, cmd: wire.broadcast(res) };
  }

  const updated = Game.updateFromSpace({
    broadcast: (msg) => {
      return sendToSpace({
        sendToUser: wire.sendToUser,
        model: modelAfter,
        spaceId: space.spaceId,
        msg: { t: "game", c: msg },
      });
    },
    model: game,
    msg: { t: "user-left", userId: ctx.currentUserId },
  });

  const modelNew: Model = {
    ...modelAfter,
    games: {
      ...modelAfter.games,
      [user.spaceId]: updated.model,
    },
  };

  return {
    model: modelNew,
    cmd: Cmd.batch([
      wire.broadcast(res),
      p(
        updated.cmd ?? Cmd.None,
        Cmd.map((msg): Msg => ({ t: "game", spaceId: space.spaceId, c: msg }))
      ),
    ]),
  };
};

export const updateFromApp = ({
  msg,
  model,
  sendToClient,
}: {
  msg: AppMsg;
  model: Model;
  sendToClient: (clientId: ClientId[], msg: ToClient) => Cmd;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.t === "client-connected") {
    return {
      model,
      cmd: sendToClient([msg.clientId], {
        t: "list",
        result: Ok(model),
        initiatorMsg: msg,
      }),
    };
  }

  if (msg.t === "client-authenticated") {
    return {
      model,
      cmd: sendToClient([msg.clientId], {
        t: "list",
        result: Ok(model),
        initiatorMsg: msg,
      }),
    };
  }

  return {
    model,
  };
};

const sendToSpace = ({
  model,
  sendToUser,
  spaceId,
  msg,
}: {
  model: Model;
  sendToUser: (userIds: UserId[], msg: ToClient) => Cmd;
  spaceId: SpaceId;
  msg: ToClient;
}): Cmd => {
  const userIds: UserId[] = [];

  for (const userId in model.users) {
    if (!UserId.is(userId)) {
      continue;
    }

    const user = model.users[userId];

    if (!user) {
      continue;
    }

    if (user.spaceId === spaceId) {
      userIds.push(userId);
    }
  }

  return sendToUser(userIds, msg);
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (model: Model): Sub<Msg> => {
  const subs: Sub<Msg>[] = [];

  for (const spaceId in model.spaces) {
    if (!SpaceId.is(spaceId)) {
      continue;
    }

    const game = model.games[spaceId];

    if (!game) {
      continue;
    }

    const sub = p(
      Game.subscriptions(`space/${spaceId}`, game),
      Sub.map((msg): Msg => ({ t: "game", spaceId, c: msg }))
    );

    subs.push(sub);
  }

  return Sub.batch(subs);
};
