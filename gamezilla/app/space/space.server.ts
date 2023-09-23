import { Eff, Err, Ok, Posix, Sub, dissoc } from "gamezilla/@SHARED/core";
import {
  ReqCtx,
  ServerCmd,
  ServerCtx,
  ServerEvt,
  broadcast,
  sendBack,
  sendToClient,
  sendToUser,
} from "gamezilla/app/@SHARED/server";
import {
  Space,
  SpaceServerCmd,
  SpaceServerCtx,
} from "gamezilla/app/space/@SHARED";
import * as GameServer from "./game/game.server";
import { createSpaceStoreInMemory } from "./space-store";
import { ServerModel, ServerMsg, ToClient, ToServer } from "./space.core";

//
//
//
// Model
//
//
//

export const SpaceStore = createSpaceStoreInMemory({
  maxEntryCount: 20,
});

export const init: ServerModel = SpaceStore.init(Posix.now());

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
  ctx,
}: {
  ctx: ServerCtx;
  msg: ServerMsg;
  model: ServerModel;
}): Promise<{
  model: ServerModel;
  eff?: Eff<ServerMsg>;
  cmd?: ServerCmd<ToClient>[];
}> => {
  switch (msg.t) {
    case "game": {
      const { spaceId } = msg;

      const space = await SpaceStore.get(ctx.now, model, spaceId);

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
        ctx: spaceCtx,
        model: space.game,
        msg: msg.c,
      });

      const spaceNew: Space<GameServer.Model> = {
        ...space,
        game: updated.model,
      };

      const modelNew = await SpaceStore.assoc(ctx.now, model, spaceNew);

      return {
        model: modelNew,
        eff: Eff.map_(
          (m): ServerMsg => ({ t: "game", spaceId, c: m }),
          updated.eff
        ),
        cmd: spaceCmdToCmd(
          spaceNew,
          SpaceServerCmd.map(
            (c) => ({ t: "game", spaceId: msg.spaceId, c }),
            updated.cmd
          )
        ),
      };
    }
  }
};

export const updateFromClient = async (input: {
  ctx: ReqCtx;
  msg: ToServer;
  model: ServerModel;
}): Promise<{
  model: ServerModel;
  cmd?: ServerCmd<ToClient>[];
  eff?: Eff<ServerMsg>;
}> => {
  const { msg, model, ctx } = input;

  switch (msg.t) {
    case "list": {
      const listed = await SpaceStore.list(ctx.now, model);

      const profiles = listed.reduce(
        (acc, space) => ({ ...acc, ...space.profileCache }),
        {}
      );

      return {
        model,
        cmd: [sendBack(ctx, { t: "list", profiles, result: Ok(listed) })],
      };
    }

    case "join": {
      const currentSpace = await SpaceStore.getByUserId(
        ctx.now,
        model,
        ctx.currentUserId
      );

      if (currentSpace) {
        return {
          model,
          cmd: [
            sendBack(ctx, {
              ...msg,
              result: Err(
                "You're already in a space. You must leave your current space before joining another"
              ),
            }),
          ],
        };
      }

      const space = await SpaceStore.get(ctx.now, model, msg.spaceId);

      if (!space) {
        return {
          model,
          cmd: [sendBack(ctx, { ...msg, result: Err("Space was not found") })],
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

      const modelNew = await SpaceStore.assoc(ctx.now, model, spaceNew);

      return {
        model: modelNew,
        cmd: [{ t: "broadcast", msg: { ...msg, result: Ok(spaceNew) } }],
      };
    }

    case "destroy": {
      const currentSpace = await SpaceStore.getByUserId(
        ctx.now,
        model,
        ctx.currentUserId
      );

      if (!currentSpace) {
        return {
          model,
          cmd: [sendBack(ctx, { ...msg, result: Err("Failed to find space") })],
        };
      }

      if (currentSpace.hostId !== ctx.currentUserId) {
        return {
          model,
          cmd: [
            sendBack(ctx, {
              ...msg,
              result: Err("You must be the host to destroy the space"),
            }),
          ],
        };
      }

      const modelNew = await SpaceStore.dissoc(
        ctx.now,
        model,
        currentSpace.spaceId
      );

      return {
        model: modelNew,
        cmd: [
          broadcast({
            ...msg,
            profiles: currentSpace.profileCache,
            result: Ok(currentSpace),
          }),
        ],
      };
    }

    case "create": {
      const currentSpace = await SpaceStore.getByUserId(
        ctx.now,
        model,
        ctx.currentUserId
      );

      if (currentSpace) {
        return {
          model,
          cmd: [
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

      const modelNew = await SpaceStore.assoc(ctx.now, model, spaceNew);

      return {
        model: modelNew,
        cmd: [
          broadcast({
            ...msg,
            profiles: spaceNew.profileCache,
            result: Ok(spaceNew),
          }),
        ],
      };
    }

    case "input-game": {
      const currentSpace = await SpaceStore.getByUserId(
        ctx.now,
        model,
        ctx.currentUserId
      );

      if (!currentSpace) {
        return {
          model,
          cmd: [
            sendBack(ctx, {
              ...msg,
              result: Err("Failed to find space"),
            }),
          ],
        };
      }

      if (currentSpace.hostId !== ctx.currentUserId) {
        return {
          model,
          cmd: [
            sendBack(ctx, {
              ...msg,
              result: Err("You must be the host to change the game"),
            }),
          ],
        };
      }

      if (!msg.gameName) {
        const spaceNew: Space<GameServer.Model> = {
          ...currentSpace,
          game: null,
          profileCache: msg.profile
            ? {
                ...currentSpace.profileCache,
                [msg.profile.userId]: msg.profile,
              }
            : currentSpace.profileCache,
        };

        const modelNew = await SpaceStore.assoc(ctx.now, model, spaceNew);

        return {
          model: modelNew,
          cmd: [
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
          hostId: currentSpace.hostId,
        },
      });

      const spaceNew: Space<GameServer.Model> = {
        ...currentSpace,
        game: initial.model,
        profileCache: msg.profile
          ? {
              ...currentSpace.profileCache,
              [msg.profile.userId]: msg.profile,
            }
          : currentSpace.profileCache,
      };

      const modelNew = await SpaceStore.assoc(ctx.now, model, spaceNew);

      return {
        model: modelNew,
        cmd: [
          {
            t: "broadcast",
            msg: {
              ...msg,
              profiles: spaceNew.profileCache,
              result: Ok(spaceNew),
            },
          },
        ],
        eff: Eff.map_(
          (c) => ({ t: "game", c, spaceId: currentSpace.spaceId }),
          initial.eff
        ),
      };
    }

    case "leave": {
      const space = await SpaceStore.getByUserId(
        ctx.now,
        model,
        ctx.currentUserId
      );

      if (!space) {
        return {
          model,
          cmd: [sendBack(ctx, { ...msg, result: Err("Failed to find space") })],
        };
      }

      if (space.hostId === ctx.currentUserId) {
        return {
          model,
          cmd: [
            sendBack(ctx, {
              ...msg,
              result: Err("You must destroy the space to leave as host"),
            }),
          ],
        };
      }

      const spaceNew: Space<GameServer.Model> = {
        ...space,
        users: dissoc(space.users, ctx.currentUserId),
        profileCache: msg.profile
          ? {
              ...space.profileCache,
              [msg.profile.userId]: msg.profile,
            }
          : space.profileCache,
      };

      const updated = !spaceNew.game
        ? {
            model: spaceNew.game,
            eff: Eff.None,
          }
        : GameServer.updateFromEvt({
            ctx: { ...ctx, hostId: space.hostId },
            model: spaceNew.game,
            msg: { t: "user-left", userId: ctx.currentUserId },
          });

      const modelNew = await SpaceStore.assoc(ctx.now, model, spaceNew);

      return {
        model: modelNew,
        cmd: [
          broadcast({
            ...msg,
            profiles: spaceNew.profileCache,
            result: Ok(spaceNew),
          }),
        ],
        eff: Eff.batch([
          Eff.map_(
            (c) => ({ t: "game", spaceId: space.spaceId, c }),
            updated.eff
          ),
        ]),
      };
    }

    case "game": {
      const space = await SpaceStore.getByUserId(
        ctx.now,
        model,
        ctx.currentUserId
      );

      if (!space) {
        return { model };
      }

      if (!space.game) {
        return { model };
      }

      const updated = GameServer.updateFromClient({
        ctx: { ...ctx, hostId: space.hostId },
        msg: msg.c,
        model: space.game,
      });

      const spaceNew: Space<GameServer.Model> = {
        ...space,
        game: updated.model,
      };

      const modelNew = await SpaceStore.assoc(ctx.now, model, spaceNew);

      return {
        model: modelNew,
        eff: Eff.map_(
          (c) => ({ t: "game", spaceId: space.spaceId, c }),
          updated.eff
        ),
        cmd: spaceCmdToCmd(
          spaceNew,
          SpaceServerCmd.map(
            (m) => ({ t: "game", spaceId: space.spaceId, c: m }),
            updated.cmd
          )
        ),
      };
    }
  }
};

const spaceCmdToCmd = (
  space: Space<GameServer.Model>,
  cmd?: SpaceServerCmd<ToClient>[]
) => {
  return cmd?.map((cmd): ServerCmd<ToClient> => {
    switch (cmd.t) {
      case "send-to-space": {
        const userIds = Object.values(space.users);
        return sendToUser(userIds, cmd.msg);
      }
      default: {
        return cmd;
      }
    }
  });
};

export const updateFromEvt = async (input: {
  ctx: ServerCtx;
  msg: ServerEvt;
  model: ServerModel;
}): Promise<{
  model: ServerModel;
  eff?: Eff<ServerMsg>;
  cmd?: ServerCmd<ToClient>[];
}> => {
  const { msg } = input;

  switch (msg.t) {
    case "client-authenticated": {
      if (msg.loggedIn) {
        return listSpaces(input);
      }

      return input;
    }

    case "client-connected": {
      if (msg.userId) {
        return listSpaces(input);
      }
      return input;
    }

    default: {
      return input;
    }
  }
};

const listSpaces: typeof updateFromEvt = async (input) => {
  const listed = await SpaceStore.list(input.ctx.now, input.model);

  return {
    ...input,
    cmd: [
      sendToClient([input.msg.clientId], {
        t: "list",
        result: Ok(listed),
        source: input.msg,
      }),
    ],
  };
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
  const batch: Sub<ServerMsg>[] = [];
  for (const space of await SpaceStore.list(ctx.now, model)) {
    if (!space.game) {
      continue;
    }
    const sub = GameServer.subscriptions(space.spaceId, space.game);
    const mapped = Sub.map(
      sub,
      (msg): ServerMsg => ({
        t: "game",
        c: msg,
        spaceId: space.spaceId,
      })
    );
    batch.push(mapped);
  }
  return Sub.batch(batch);
};
