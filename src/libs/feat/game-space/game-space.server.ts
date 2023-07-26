import {
  Cmd,
  Err,
  Ok,
  Result,
  Sub,
  andThen,
  exhaustive,
  p,
  removeKey,
} from "@gamezilla/core";
import { ClientId, GameSpaceId, UserId } from "@gamezilla/shared/app";
import {
  GameSpace,
  GameSpaceMsg,
  GameSpaceReqCtx,
  GameSpaceServerCtx,
} from "@gamezilla/shared/game-space";
import {
  ServerReqCtx,
  ServerAppMsg,
  ServerCtx,
} from "@gamezilla/shared/server";
import { GameSpaceDb } from "./game-space-db";
import {
  Req,
  Res,
  ServerModel,
  ServerMsg,
  ToClient,
  ToServer,
  handle,
} from "./game-space.core";
import * as Game from "./game.server";
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
  ctx: ServerCtx;
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

      const spaceCtx: GameSpaceServerCtx = {
        ...ctx,
        hostId: space.hostId,
      };

      const updated = Game.update({
        sendToSpace: (m) =>
          sendToSpace({ sendToUser, model, spaceId, msg: { t: "game", c: m } }),
        msg: gameMsg,
        model: game,
        ctx: spaceCtx,
      });

      const modelNew: Model = {
        ...model,
        games: {
          ...model.games,
          [spaceId]: updated.model,
        },
      };

      return {
        model: modelNew,
        cmd: p(
          updated.cmd ?? Cmd.None,
          Cmd.map((m): Msg => ({ t: "game", spaceId, c: m }))
        ),
      };
    }
  }
};

type UpdateFromClient = (input: {
  ctx: ServerReqCtx | null;
  sendToClient: (msg: ToClient) => Cmd;
  sendToUser: (userId: UserId[], msg: ToClient) => Cmd;
  broadcast: (msg: ToClient) => Cmd;
  msg: ToServer;
  model: Model;
}) => {
  model: Model;
  cmd?: Cmd<ServerMsg>;
};
export const updateFromClient: UpdateFromClient = (input) => {
  return p(
    input,
    andThen(({ model }) => updateProfiles({ ...input, model })),
    andThen(({ model }) => updateFromClient_({ ...input, model }))
  );
};

const updateProfiles: UpdateFromClient = ({ msg, model }) => {
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

export const updateFromClient_: UpdateFromClient = (input) => {
  const { msg, model, ctx } = input;
  switch (msg.t) {
    case "list":
    case "join":
    case "destroy":
    case "create": {
      if (!ctx) {
        return { model };
      }

      const res: Res = { ...msg, result: handle({ ctx, model, msg }) };

      if (res.result.t === "err") {
        return { model, cmd: input.sendToClient(res) };
      }

      return {
        model: res.result.value,
        cmd: input.broadcast(res),
      };
    }

    case "input-game": {
      return handleInputGame(input);
    }

    case "leave": {
      return updateLeave(input);
    }

    case "game": {
      if (!ctx) {
        return { model };
      }

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

      const spaceCtx: GameSpaceReqCtx = {
        ...ctx,
        hostId: space.hostId,
      };

      const gameUpdated = Game.updateFromClient({
        ...ctx,
        ctx: spaceCtx,
        sendToClient: (m) => input.sendToClient({ t: "game", c: m }),
        sendToSpace: (m) =>
          sendToSpace({
            sendToUser: input.sendToUser,
            model,
            spaceId: space.gameSpaceId,
            msg: { t: "game", c: m },
          }),
        msg: gameMsg,
        model: game,
      });

      const modelNew: Model = {
        ...model,
        games: {
          ...model.games,
          [space.gameSpaceId]: gameUpdated.model,
        },
      };

      return {
        model: modelNew,
        cmd: p(
          gameUpdated.cmd ?? Cmd.None,
          Cmd.map(
            (msg): Msg => ({ t: "game", spaceId: space.gameSpaceId, c: msg })
          )
        ),
      };
    }

    default:
      return exhaustive(msg[0]);
  }
};

const handleInputGame: UpdateFromClient = ({
  msg,
  model,
  ctx,
  sendToClient,
  sendToUser,
  broadcast,
}) => {
  if (msg.t !== "input-game") {
    return { model };
  }

  if (!ctx) {
    return { model };
  }

  const user = model.users[ctx.currentUserId];

  if (!user) {
    return { model };
  }

  const space = model.spaces[user.spaceId];

  if (!space) {
    return { model };
  }

  if (space.hostId !== ctx.currentUserId) {
    return {
      model,
      cmd: broadcast({ t: "input-game", result: Err("You must be the host") }),
    };
  }

  if (!msg.gameName) {
    const modelNew: Model = {
      ...model,
      games: removeKey(user.spaceId, model.games),
    };

    return {
      model: modelNew,
      cmd: broadcast({ t: "input-game", result: Ok(modelNew) }),
    };
  }
  const initial = Game.init({ gameName: msg.gameName })({
    ctx: {
      ...ctx,
      hostId: space.hostId,
    },
    sendToClient: (m) => sendToClient({ t: "game", c: m }),
    sendToSpace: (m) =>
      sendToSpace({
        sendToUser,
        model,
        spaceId: user.spaceId,
        msg: { t: "game", c: m },
      }),
  });

  const modelNew: Model = {
    ...model,
    games: {
      ...model.games,
      [user.spaceId]: initial.model,
    },
  };

  return {
    model: modelNew,
    cmd: Cmd.batch([
      p(
        initial.cmd ?? Cmd.None,
        Cmd.map(
          (m): Msg => ({
            t: "game",
            c: m,
            spaceId: user.spaceId,
          })
        )
      ),
      broadcast({ t: "input-game", result: Ok(modelNew) }),
    ]),
  };
};

const updateLeave: UpdateFromClient = ({
  broadcast,
  sendToClient,
  sendToUser,
  model,
  msg,
  ctx,
}) => {
  if (msg.t !== "leave") {
    return { model };
  }

  if (!ctx) {
    return { model };
  }

  const result = handle({ ctx, model, msg });
  const res: Res = { ...msg, result };

  if (result.t === "err") {
    return { model, cmd: sendToClient(res) };
  }

  const modelAfter = result.value;

  const user = model.users[ctx.currentUserId];

  if (!user) {
    return { model: modelAfter, cmd: broadcast(res) };
  }

  const space = model.spaces[user.spaceId];

  if (!space) {
    return { model: modelAfter, cmd: broadcast(res) };
  }

  const game = model.games[space.gameSpaceId];

  if (!game) {
    return { model: modelAfter, cmd: broadcast(res) };
  }

  const gameSpaceCtx: GameSpaceServerCtx = {
    ...ctx,
    hostId: space.hostId,
  };

  const updated = Game.updateFromSpace({
    ctx: gameSpaceCtx,
    sendToClient: (m) => {
      return sendToClient({ t: "game", c: m });
    },
    sendToSpace: (msg) => {
      return sendToSpace({
        sendToUser: sendToUser,
        model: modelAfter,
        spaceId: space.gameSpaceId,
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
      broadcast(res),
      p(
        updated.cmd ?? Cmd.None,
        Cmd.map(
          (msg): Msg => ({ t: "game", spaceId: space.gameSpaceId, c: msg })
        )
      ),
    ]),
  };
};

export const updateFromApp = ({
  msg,
  model,
  sendToClient,
}: {
  msg: ServerAppMsg;
  model: Model;
  sendToClient: (clientId: ClientId[], msg: ToClient) => Cmd;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  // if (msg.t === "client-connected") {
  //   return {
  //     model,
  //     cmd: sendToClient([msg.clientId], {
  //       t: "list",
  //       result: Ok(model),
  //       initiatorMsg: msg,
  //     }),
  //   };
  // }

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
  spaceId: GameSpaceId;
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

export const subscriptions = ({
  model,
  ctx,
}: {
  ctx: ServerCtx;
  model: Model;
}): Sub<Msg> => {
  const subs: Sub<Msg>[] = [];

  for (const spaceId in model.spaces) {
    if (!GameSpaceId.is(spaceId)) {
      continue;
    }

    const game = model.games[spaceId];

    if (!game) {
      continue;
    }

    const space = model.spaces[spaceId];

    if (!space) {
      continue;
    }

    const gameSpaceCtx: GameSpaceServerCtx = {
      ...ctx,
      hostId: space.hostId,
    };

    const sub = p(
      Game.subscriptions({
        intervalId: `space/${spaceId}`,
        model: game,
        ctx: gameSpaceCtx,
      }),
      Sub.map((msg): Msg => ({ t: "game", spaceId, c: msg }))
    );

    subs.push(sub);
  }

  return Sub.batch(subs);
};

//
//
//
//
//
//

export type Problem =
  | { t: "must-be-host" }
  | { t: "not-in-a-space" }
  | { t: "already-in-a-space" }
  | { t: "db-problem"; problem: string };

type Res_ = Req & { result: Result<Problem, null> };

export const handler = async ({
  req,
  ctx,
  spaceDb,
}: {
  req: Req;
  ctx: GameSpaceReqCtx;
  spaceDb: GameSpaceDb;
}): Promise<Res_ & { msgs?: GameSpaceMsg[] }> => {
  //
  //
  //
  //

  const got = await spaceDb.getByUserId(ctx.currentUserId);

  if (got.t === "err") {
    return { ...req, result: Err({ t: "db-problem", problem: got.error }) };
  }

  const space = got.value;

  //
  //
  //
  //

  if (req.t === "create") {
    if (space) {
      return { ...req, result: Err({ t: "already-in-a-space" }) };
    }

    const spaceNew: GameSpace = {
      status: "started",
      hostId: ctx.currentUserId,
      gameSpaceId: req.spaceId,
      users: {},
    };

    console.log({ spaceNew });

    return { ...req, result: Ok(null) };
  }

  //
  //
  //

  if (req.t === "destroy") {
    if (!space) {
      return { ...req, result: Err({ t: "not-in-a-space" }) };
    }

    if (space.hostId !== ctx.currentUserId) {
      return { ...req, result: Err({ t: "must-be-host" }) };
    }

    const spaceNew: GameSpace = {
      ...space,
      status: "ended",
    };

    const set = await spaceDb.set(spaceNew);

    if (set.t === "err") {
      return { ...req, result: Err({ t: "db-problem", problem: set.error }) };
    }

    return { ...req, result: Ok(null) };
  }

  //
  //
  //

  if (req.t === "join") {
    if (!space) {
      return { ...req, result: Err({ t: "not-in-a-space" }) };
    }

    return {
      ...req,
      msgs: [{ t: "user-left", userId: ctx.currentUserId }],
      result: Ok(null),
    };
  }

  //
  //
  //

  if (req.t === "leave") {
    if (!space) {
      return { ...req, result: Err({ t: "not-in-a-space" }) };
    }

    return {
      ...req,
      msgs: [{ t: "user-left", userId: ctx.currentUserId }],
      result: Ok(null),
    };
  }

  //
  //
  //

  //
  //
  //
  //

  return { ...req, result: Ok(null) };
};
