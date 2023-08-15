import {
  ClientId,
  Cmd,
  Err,
  Ok,
  Sub,
  p,
  removeKey,
} from "gamezilla/@SHARED/core";
import { UserId } from "gamezilla/app/@SHARED/data";
import {
  ServerEffect,
  ServerCtx,
  ReqCtx,
  ServerEvent,
} from "gamezilla/app/@SHARED/server";
import { SpaceServerCtx, Space } from "gamezilla/app/space/@SHARED";
import * as GameServer from "./game/game.server";
import { makeSpaceDb } from "./space-db";
import { ServerModel, ServerMsg, ToClient, ToServer } from "./space.core";

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

      const spaceCtx: SpaceServerCtx = {
        ...ctx,
        hostId: space.hostId,
      };

      const updated = GameServer.update({
        sendToSpace: (m) =>
          sendToSpace(sendToUser, space, {
            t: "game",
            c: m,
          }),
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

const sendBack = (ctx: ReqCtx, msg: ToClient): ServerEffect<ToClient> => {
  return {
    t: "send-to-client",
    clientIds: [ctx.clientId],
    msg,
  };
};

export const updateFromClient = async (input: {
  ctx: ReqCtx;
  msg: ToServer;
  model: ServerModel;
  sendToClient: (msg: ToClient) => Cmd;
  sendToUser: (userIds: UserId[], msg: ToClient) => Cmd;
}): Promise<{
  model: ServerModel;
  eff?: ServerEffect<ToClient>[];
  cmd?: Cmd<ServerMsg>;
}> => {
  const { msg, model, ctx, sendToClient, sendToUser } = input;

  switch (msg.t) {
    case "list": {
      const result = await spaceDb.getAll();

      const profiles =
        result.t === "ok"
          ? result.value.reduce(
              (acc, space) => ({ ...acc, ...space.profileCache }),
              {}
            )
          : {};

      return {
        model,
        eff: [sendBack(ctx, { t: "list", profiles, result })],
      };
    }

    case "join": {
      const currentSpace = await spaceDb.getByUserId(msg.userId);

      if (currentSpace.t === "err") {
        return {
          model,
          eff: [
            sendBack(ctx, {
              ...msg,
              result: Err(
                "You're already in a space. You must leave your current space before joining another"
              ),
            }),
          ],
        };
      }

      const foundSpace = await spaceDb.get(msg.spaceId);

      if (foundSpace.t === "err") {
        return {
          model,
          eff: [sendBack(ctx, { ...msg, result: foundSpace })],
        };
      }

      const space = foundSpace.value;

      if (!space) {
        return {
          model,
          eff: [
            sendBack(ctx, {
              ...msg,
              result: Err("Game space was not found"),
            }),
          ],
        };
      }

      const spaceNew: Space<GameServer.Model> = {
        ...space,
        users: {
          ...space.users,
          [ctx.currentUserId]: ctx.currentUserId,
        },
        profileCache: msg.profile
          ? {
              ...space.profileCache,
              [ctx.currentUserId]: msg.profile,
            }
          : space.profileCache,
      };

      const mutated = await spaceDb.set(spaceNew);

      if (mutated.t === "err") {
        return {
          model,
          eff: [sendBack(ctx, { ...msg, result: mutated })],
        };
      }

      return {
        model,
        eff: [{ t: "broadcast", msg: { ...msg, result: Ok(spaceNew) } }],
      };
    }

    case "destroy": {
      const currentSpace = await spaceDb.getByUserId(ctx.currentUserId);

      if (currentSpace.t === "err") {
        return {
          model,
          eff: [sendBack(ctx, { ...msg, result: currentSpace })],
        };
      }

      const space = currentSpace.value;

      if (!space) {
        return {
          model,
          eff: [sendBack(ctx, { ...msg, result: Err("Failed to find space") })],
        };
      }

      if (space.hostId !== ctx.currentUserId) {
        return {
          model,
          eff: [
            sendBack(ctx, {
              ...msg,
              result: Err("You must be the host to destroy a space"),
            }),
          ],
        };
      }

      const mutated = await spaceDb.zap(space.spaceId);

      if (mutated.t === "err") {
        return {
          model,
          eff: [sendBack(ctx, { ...msg, result: mutated })],
        };
      }

      return {
        model,
        eff: [
          {
            t: "broadcast",
            msg: { ...msg, profiles: space.profileCache, result: Ok(space) },
          },
        ],
      };
    }

    case "create": {
      const currentSpace = await spaceDb.getByUserId(ctx.currentUserId);

      if (currentSpace.t === "err") {
        return {
          model,
          eff: [sendBack(ctx, { ...msg, result: currentSpace })],
        };
      }

      const space = currentSpace.value;

      if (space) {
        return {
          model,
          eff: [
            sendBack(ctx, {
              ...msg,
              result: Err(
                "You're already in a space. You must leave your current space before creating another"
              ),
            }),
          ],
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
        profileCache: msg.profile
          ? {
              [ctx.currentUserId]: msg.profile,
            }
          : {},
      };

      const mutated = await spaceDb.set(spaceNew);

      if (mutated.t === "err") {
        return {
          model,
          eff: [sendBack(ctx, { ...msg, result: mutated })],
        };
      }

      return {
        model,
        eff: [
          {
            t: "broadcast",
            msg: {
              ...msg,
              profiles: spaceNew.profileCache,
              result: Ok(spaceNew),
            },
          },
        ],
      };
    }

    case "input-game": {
      const currentSpace = await spaceDb.getByUserId(ctx.currentUserId);

      if (currentSpace.t === "err") {
        return {
          model,
          eff: [sendBack(ctx, { ...msg, result: currentSpace })],
        };
      }

      const space = currentSpace.value;

      if (!space) {
        return {
          model,
          eff: [
            sendBack(ctx, {
              ...msg,
              result: Err("Failed to find space"),
            }),
          ],
        };
      }

      if (space.hostId !== ctx.currentUserId) {
        return {
          model,
          eff: [
            sendBack(ctx, {
              ...msg,
              result: Err("You must be the host to change the game"),
            }),
          ],
        };
      }

      if (!msg.gameName) {
        const spaceNew: Space<GameServer.Model> = {
          ...space,
          game: null,
          profileCache: msg.profile
            ? {
                ...space.profileCache,
                [msg.profile.userId]: msg.profile,
              }
            : space.profileCache,
        };

        const mutated = await spaceDb.set(spaceNew);

        if (mutated.t === "err") {
          return {
            model,
            eff: [sendBack(ctx, { ...msg, result: mutated })],
          };
        }

        return {
          model,
          eff: [
            {
              t: "broadcast",
              msg: {
                ...msg,
                profiles: spaceNew.profileCache,
                result: Ok(spaceNew),
              },
            },
          ],
        };
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
        profileCache: msg.profile
          ? {
              ...space.profileCache,
              [msg.profile.userId]: msg.profile,
            }
          : space.profileCache,
      };

      const mutated = await spaceDb.set(spaceNew);

      if (mutated.t === "err") {
        return { model, cmd: sendToClient({ ...msg, result: mutated }) };
      }

      return {
        model,
        eff: [
          {
            t: "broadcast",
            msg: {
              ...msg,
              profiles: spaceNew.profileCache,
              result: Ok(spaceNew),
            },
          },
        ],
        cmd: Cmd.map_(
          (m): ServerMsg => ({ t: "game", c: m, spaceId: space.spaceId }),
          initial.cmd
        ),
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
        profileCache: msg.profile
          ? {
              ...space.profileCache,
              [msg.profile.userId]: msg.profile,
            }
          : space.profileCache,
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
        eff: [
          {
            t: "broadcast",
            msg: {
              ...msg,
              profiles: spaceNew.profileCache,
              result: Ok(spaceNew),
            },
          },
        ],
        cmd: Cmd.batch([
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

export const updateFromParent = (input: {
  msg: ServerEvent;
  model: ServerModel;
  sendToClient: (clientId: ClientId[], msg: ToClient) => Cmd;
}): {
  model: ServerModel;
  cmd?: Cmd<ServerMsg>;
} => {
  const { msg } = input;

  switch (msg.t) {
    default: {
      return input;
    }
  }
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

export const subscriptions = Sub.create<ServerMsg>();

const spaceSub = (space: Space<GameServer.Model>): Sub<ServerMsg> => {
  if (space.game) {
    return Sub.map(
      GameServer.subscriptions(space.spaceId, space.game),
      (msg) => ({ t: "game", c: msg, spaceId: space.spaceId })
    );
  }

  return Sub.None;
};

const unsubscribes = new Map<string, () => void>();

spaceDb.sub.subscribe((msg) => {
  switch (msg.t) {
    case "set": {
      unsubscribes.get(msg.space.spaceId)?.();
      unsubscribes.set(
        msg.space.spaceId,
        spaceSub(msg.space).subscribe(subscriptions.publish)
      );
      return;
    }
    case "zap": {
      unsubscribes.get(msg.spaceId)?.();
      return;
    }
  }
});
