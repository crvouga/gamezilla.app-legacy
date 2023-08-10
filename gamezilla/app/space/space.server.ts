import { ClientId, Cmd, Err, Ok, Sub, removeKey } from "gamezilla/@/core";
import { UserId } from "gamezilla/app/@";
import { ServerAppMsg, ServerCtx, ServerReqCtx } from "gamezilla/app/@/server";
import { Space, GameSpaceServerCtx } from "gamezilla/app/space/@";
import { ServerModel, ServerMsg, ToClient, ToServer } from "./space.core";
import * as GameServer from "./game/game.server";
import { makeSpaceDb } from "./space-db";

//
//
//
// Model
//
//
//

const spaceDb = makeSpaceDb();

export const init: ServerModel = null;

//
//
//
// Update
//
//
//

export const update = async ({
  model,
  msg,
  sendToUser,
  ctx,
}: {
  ctx: ServerCtx;
  sendToUser: (userIds: UserId[], msg: ToClient) => Cmd;
  msg: ServerMsg;
  model: ServerModel;
}): Promise<{ model: ServerModel; cmd?: Cmd<ServerMsg> }> => {
  switch (msg.t) {
    case "game": {
      const { spaceId } = msg;

      const got = await spaceDb.get(spaceId);

      if (got.t === "err") {
        return { model };
      }

      const space = got.value;

      if (!space) {
        return { model };
      }

      if (!space.game) {
        return { model };
      }

      const spaceCtx: GameSpaceServerCtx = {
        ...ctx,
        hostId: space.hostId,
      };

      const updated = GameServer.update({
        sendToSpace: (m) => sendToSpace(sendToUser, space, { t: "game", c: m }),
        msg: msg.c,
        model: space.game,
        ctx: spaceCtx,
      });

      const spaceNew: Space<GameServer.Model> = {
        ...space,
        game: updated.model,
      };

      const mutated = await spaceDb.set(spaceNew);

      if (mutated.t === "err") {
        return { model };
      }

      return {
        model,
        cmd: Cmd.map_(
          (m): ServerMsg => ({ t: "game", spaceId, c: m }),
          updated.cmd
        ),
      };
    }
  }
};

export const updateFromClient = async (input: {
  ctx: ServerReqCtx;
  sendToClient: (msg: ToClient) => Cmd;
  sendToUser: (userId: UserId[], msg: ToClient) => Cmd;
  broadcast: (msg: ToClient) => Cmd;
  msg: ToServer;
  model: ServerModel;
}): Promise<{
  model: ServerModel;
  cmd?: Cmd<ServerMsg>;
}> => {
  const { msg, model, ctx, broadcast, sendToUser, sendToClient } = input;

  switch (msg.t) {
    case "list": {
      const got = await spaceDb.getAll();

      return { model, cmd: sendToClient({ t: "list", result: got }) };
    }

    case "join": {
      const currentSpace = await spaceDb.getByUserId(msg.userId);

      if (currentSpace.t === "err") {
        return {
          model,
          cmd: sendToClient({
            ...msg,
            result: Err(
              "You're already in a space. You must leave your current space before joining another"
            ),
          }),
        };
      }

      const foundSpace = await spaceDb.get(msg.spaceId);

      if (foundSpace.t === "err") {
        return { model, cmd: sendToClient({ ...msg, result: foundSpace }) };
      }

      const space = foundSpace.value;

      if (!space) {
        return {
          model,
          cmd: sendToClient({
            ...msg,
            result: Err("Game space was not found"),
          }),
        };
      }

      const spaceNew: Space<GameServer.Model> = {
        ...space,
        users: {
          ...space.users,
          [ctx.currentUserId]: ctx.currentUserId,
        },
      };

      const mutated = await spaceDb.set(spaceNew);

      if (mutated.t === "err") {
        return { model, cmd: sendToClient({ ...msg, result: mutated }) };
      }

      return { model, cmd: broadcast({ ...msg, result: Ok(spaceNew) }) };
    }

    case "destroy": {
      const currentSpace = await spaceDb.getByUserId(ctx.currentUserId);

      if (currentSpace.t === "err") {
        return { model, cmd: sendToClient({ ...msg, result: currentSpace }) };
      }

      const space = currentSpace.value;

      if (!space) {
        return {
          model,
          cmd: sendToClient({ ...msg, result: Err("Failed to find space") }),
        };
      }

      if (space.hostId !== ctx.currentUserId) {
        return {
          model,
          cmd: sendToClient({
            ...msg,
            result: Err("You must be the host to destroy a space"),
          }),
        };
      }

      // const spaceNew: GameSpace<Game.Model> = {
      //   ...space,
      //   state: "ended",
      // };

      const mutated = await spaceDb.zap(space.spaceId);

      if (mutated.t === "err") {
        return { model, cmd: sendToClient({ ...msg, result: mutated }) };
      }

      return { model, cmd: broadcast({ ...msg, result: Ok(space) }) };
    }

    case "create": {
      const currentSpace = await spaceDb.getByUserId(ctx.currentUserId);

      if (currentSpace.t === "err") {
        return { model, cmd: sendToClient({ ...msg, result: currentSpace }) };
      }

      const space = currentSpace.value;

      if (space) {
        return {
          model,
          cmd: sendToClient({
            ...msg,
            result: Err(
              "You're already in a space. You must leave your current space before creating another"
            ),
          }),
        };
      }

      const spaceNew: Space<GameServer.Model> = {
        spaceId: msg.spaceId,
        hostId: ctx.currentUserId,
        state: "started",
        visibility: "public",
        users: {
          [ctx.currentUserId]: ctx.currentUserId,
        },
      };

      const mutated = await spaceDb.set(spaceNew);

      if (mutated.t === "err") {
        return { model, cmd: sendToClient({ ...msg, result: mutated }) };
      }

      return { model, cmd: broadcast({ ...msg, result: Ok(spaceNew) }) };
    }

    case "input-game": {
      const currentSpace = await spaceDb.getByUserId(ctx.currentUserId);

      if (currentSpace.t === "err") {
        return {
          model,
          cmd: sendToClient({ ...msg, result: currentSpace }),
        };
      }

      const space = currentSpace.value;

      if (!space) {
        return {
          model,
          cmd: sendToClient({
            ...msg,
            result: Err("Failed to find space"),
          }),
        };
      }

      if (space.hostId !== ctx.currentUserId) {
        return {
          model,
          cmd: sendToClient({
            ...msg,
            result: Err("You must be the host to change the game"),
          }),
        };
      }

      if (!msg.gameName) {
        const spaceNew: Space<GameServer.Model> = {
          ...space,
          game: null,
        };

        const mutated = await spaceDb.set(spaceNew);

        if (mutated.t === "err") {
          return { model, cmd: sendToClient({ ...msg, result: mutated }) };
        }

        return { model, cmd: broadcast({ ...msg, result: Ok(spaceNew) }) };
      }

      const initial = GameServer.init({ gameName: msg.gameName })({
        ctx: {
          ...ctx,
          hostId: space.hostId,
        },
        sendToClient: (m) => sendToClient({ t: "game", c: m }),
        sendToSpace: (m) => sendToSpace(sendToUser, space, { t: "game", c: m }),
      });

      const spaceNew: Space<GameServer.Model> = {
        ...space,
        game: initial.model,
      };

      const mutated = await spaceDb.set(spaceNew);

      if (mutated.t === "err") {
        return { model, cmd: sendToClient({ ...msg, result: mutated }) };
      }

      return {
        model,
        cmd: Cmd.batch([
          broadcast({ ...msg, result: Ok(spaceNew) }),
          Cmd.map_(
            (m): ServerMsg => ({
              t: "game",
              c: m,
              spaceId: space.spaceId,
            }),
            initial.cmd
          ),
        ]),
      };
    }

    case "leave": {
      const got = await spaceDb.getByUserId(ctx.currentUserId);

      if (got.t === "err") {
        return { model, cmd: sendToClient({ ...msg, result: got }) };
      }

      const space = got.value;

      if (!space) {
        return {
          model,
          cmd: sendToClient({ ...msg, result: Err("Failed to find space") }),
        };
      }

      if (space.hostId === ctx.currentUserId) {
        return {
          model,
          cmd: sendToClient({
            ...msg,
            result: Err("You must destroy the space to leave as host"),
          }),
        };
      }

      const spaceNew: Space<GameServer.Model> = {
        ...space,
        users: removeKey(ctx.currentUserId, space.users),
      };

      const updated = !spaceNew.game
        ? { model: spaceNew.game, cmd: Cmd.None }
        : GameServer.updateFromParent({
            ctx: { ...ctx, hostId: space.hostId },
            sendToClient: (m) => sendToClient({ t: "game", c: m }),
            sendToSpace: (m) =>
              sendToSpace(sendToUser, space, { t: "game", c: m }),
            model: spaceNew.game,
            msg: { t: "user-left", userId: ctx.currentUserId },
          });

      const mutated = await spaceDb.set(spaceNew);

      if (mutated.t === "err") {
        return { model, cmd: sendToClient({ ...msg, result: mutated }) };
      }

      return {
        model,
        cmd: Cmd.batch([
          broadcast({ ...msg, result: Ok(spaceNew) }),
          Cmd.map_(
            (c): ServerMsg => ({ t: "game", spaceId: space.spaceId, c }),
            updated.cmd
          ),
        ]),
      };
    }

    case "game": {
      const got = await spaceDb.getByUserId(ctx.currentUserId);

      if (got.t === "err") {
        return { model };
      }

      const space = got.value;

      if (!space) {
        return { model };
      }

      if (!space.game) {
        return { model };
      }

      const updated = GameServer.updateFromClient({
        ...ctx,
        ctx: {
          ...ctx,
          hostId: space.hostId,
        },
        sendToClient: (m) => sendToClient({ t: "game", c: m }),
        sendToSpace: (m) => sendToSpace(sendToUser, space, { t: "game", c: m }),
        msg: msg.c,
        model: space.game,
      });

      const spaceNew: Space<GameServer.Model> = {
        ...space,
        game: updated.model,
      };

      const mutated = await spaceDb.set(spaceNew);

      if (mutated.t === "err") {
        return { model };
      }

      return {
        model,
        cmd: Cmd.map_(
          (c): ServerMsg => ({ t: "game", spaceId: space.spaceId, c }),
          updated.cmd
        ),
      };
    }
  }
};

export const updateFromApp = (input: {
  msg: ServerAppMsg;
  model: ServerModel;
  sendToClient: (clientId: ClientId[], msg: ToClient) => Cmd;
}): {
  model: ServerModel;
  cmd?: Cmd<ServerMsg>;
} => {
  const { msg } = input;

  return input;
};

const sendToSpace = (
  sendToUser: (userIds: UserId[], msg: ToClient) => Cmd,
  space: Space<GameServer.Model>,
  msg: ToClient
): Cmd => {
  return sendToUser(Object.values(space.users), msg);
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (_input: {
  ctx: ServerCtx;
  model: ServerModel;
}): Sub<ServerMsg> => {
  return Sub.None;
};
