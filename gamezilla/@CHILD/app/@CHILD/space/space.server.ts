import { Eff, Sub, chainAwait } from "gamezilla/@SHARED/core";
import { EventMeta, withMeta } from "gamezilla/@SHARED/event-stream";
import {
  Space,
  SpaceServerCmd,
  SpaceServerCtx,
} from "gamezilla/@CHILD/app/@CHILD/space/@SHARED";
import { SpaceId } from "gamezilla/@CHILD/app/@SHARED/data";
import {
  ReqCtx,
  ServerCmd,
  ServerCtx,
  ServerEvt,
  broadcast,
  sendToClient,
  sendToUser,
} from "gamezilla/@CHILD/app/@SHARED/server";
import * as GameServer from "./@CHILD/game/game.server";
import {
  Event,
  ServerModel,
  ServerMsg,
  StateSpace,
  ToClient,
  ToServer,
  appendEvent,
  initCore,
  toSpaceEvents,
  toStateSpace,
  toStateUser,
} from "./space.core";

//
//
//
// Model
//
//
//

export const init = (): {
  model: ServerModel;
} => {
  return {
    model: {
      ...initCore(),
      games: {},
      profileCache: {},
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

export const update = async ({
  model,
  msg,
  ctx,
}: {
  model: ServerModel;
  msg: ServerMsg;
  ctx: ServerCtx;
}): Promise<{
  model: ServerModel;
  eff?: Eff<ServerMsg>;
  cmd?: ServerCmd<ToClient>[];
}> => {
  switch (msg.t) {
    case "game-msg": {
      const { spaceId } = msg;

      const space = toStateSpace(model, spaceId);

      const game = model.games[spaceId];

      if (!game) {
        return { model };
      }

      if (space.type === "initial") {
        return { model };
      }

      if (space.type === "ended") {
        return { model };
      }

      if (!space.game) {
        return { model };
      }

      const spaceCtx: SpaceServerCtx = {
        ...ctx,
        space: space,
      };

      const updated = await GameServer.update({
        ctx: spaceCtx,
        model: game,
        msg: msg.c,
        state: space.game,
      });

      const gameEvent = updated.events?.[0] ?? null;

      return chainAwait(
        model,
        (model) => {
          if (!gameEvent) {
            return { model };
          }
          return appendEventServer(
            spaceCtx,
            model,
            withMeta({
              t: "game",
              spaceId: msg.spaceId,
              c: gameEvent,
            })
          );
        },
        (model) => {
          return {
            model: {
              ...model,
              games: {
                ...model.games,
                [spaceId]: updated.model,
              },
            },
            eff: Eff.map_(
              (c): ServerMsg => ({ t: "game-msg", spaceId, c }),
              updated.eff
            ),
            cmd: spaceCmdToCmd(
              space,
              SpaceServerCmd.map(updated.cmd ?? [], (c) => ({
                t: "game-msg",
                spaceId: msg.spaceId,
                c,
              }))
            ),
          };
        }
      );
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
    case "game-msg": {
      const space = toStateSpace(model, msg.spaceId);

      const game = model.games[msg.spaceId];

      if (!game) {
        return { model };
      }

      if (space.type === "initial") {
        return { model };
      }

      if (space.type === "ended") {
        return { model };
      }

      if (!space.game) {
        return { model };
      }

      const updated = await GameServer.updateFromClient({
        ctx: { ...ctx, space: space },
        state: space.game,
        msg: msg.c,
        model: game,
      });

      return {
        model: {
          ...model,
          games: {
            ...model.games,
            [msg.spaceId]: updated.model,
          },
        },
        eff: Eff.map_(
          (c) => ({ t: "game-msg", spaceId: space.spaceId, c }),
          updated.eff
        ),
        cmd: spaceCmdToCmd(
          space,
          SpaceServerCmd.map(updated.cmd ?? [], (c) => ({
            t: "game-msg",
            spaceId: msg.spaceId,
            c,
          }))
        ),
      };
    }

    default: {
      const prev = toStateSpace(model, msg.spaceId);

      const appended = appendEvent(model, msg);

      const next = toStateSpace(appended, msg.spaceId);

      const updated = await updateGameModel({
        model,
        msg,
        ctx,
        prev,
        next,
      });

      const cmd: ServerCmd<ToClient>[] = [];

      if (
        "userId" in msg &&
        toStateUser(model, msg.userId).spaceId !== msg.spaceId &&
        toStateUser(appended, msg.userId).spaceId === msg.spaceId
      ) {
        cmd.push(
          sendToClient([ctx.clientId], {
            t: "sync",
            events: toSpaceEvents(appended, msg.spaceId),
            profiles: model.profileCache,
          })
        );
      }

      if (msg.t === "game" && next.type === "started") {
        cmd.push(sendToUser(Object.values(next.users), msg));
      } else {
        cmd.push(broadcast(msg));
      }

      return {
        model: {
          ...model,
          ...appended,
          games: {
            ...model.games,
            ...updated.model.games,
          },
          profileCache: {
            ...model.profileCache,
            ...(msg.profile ? { [msg.profile.userId]: msg.profile } : {}),
          },
        },
        eff: updated.eff,
        cmd: cmd,
      };
    }
  }
};

const appendEventServer = async (
  ctx: ServerCtx,
  model: ServerModel,
  event: Event & EventMeta
): ReturnType<typeof update> => {
  const prev = toStateSpace(model, event.spaceId);

  const appended = appendEvent(model, event);

  const next = toStateSpace(appended, event.spaceId);

  const updated = await updateGameModel({
    model,
    msg: event,
    ctx,
    prev,
    next,
  });

  return {
    model: {
      ...model,
      ...appended,
      games: {
        ...model.games,
        ...updated.model.games,
      },
    },
    eff: updated.eff,
    cmd: [
      event.t === "game" && next.type === "started"
        ? sendToUser(Object.values(next.users), event)
        : broadcast(event),
    ],
  };
};

const spaceCmdToCmd = (space: Space, cmd?: SpaceServerCmd<ToClient>[]) => {
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

export const updateFromEvent = async (input: {
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
        return sync(input);
      }

      return input;
    }

    case "client-connected": {
      if (msg.userId) {
        return sync(input);
      }
      return input;
    }

    default: {
      return input;
    }
  }
};

const sync: typeof updateFromEvent = async (input) => {
  return {
    model: input.model,
    cmd: [
      sendToClient([input.msg.clientId], {
        t: "sync",
        events: input.model.events,
        profiles: input.model.profileCache,
      }),
    ],
  };
};

const updateGameModel = async ({
  model,
  msg,
  ctx,
  prev,
  next,
}: {
  prev: StateSpace;
  next: StateSpace;
  model: ServerModel;
  msg: Event;
  ctx: ServerCtx;
}): Promise<{
  model: ServerModel;
  eff?: Eff<ServerMsg>;
  cmd?: ServerCmd<ToClient>[];
}> => {
  switch (msg.t) {
    case "game": {
      if (
        prev.type === "initial" ||
        prev.type === "ended" ||
        next.type === "initial" ||
        next.type === "ended"
      ) {
        return { model };
      }

      const gameState = next.game;

      if (!gameState) {
        return { model };
      }

      return chainAwait(
        model,
        async (model) => {
          const gameModel = model.games[msg.spaceId];

          if (gameModel) {
            return { model };
          }

          const init = await GameServer.init({
            ctx: {
              ...ctx,
              space: next,
            },
            state: gameState,
          });

          return {
            model: {
              ...model,
              games: {
                ...model.games,
                [msg.spaceId]: init.model,
              },
            },
          };
        },
        async (model) => {
          const gameModel = model.games[msg.spaceId];

          if (!gameModel) {
            return { model };
          }

          const updated = await GameServer.updateFromGame({
            ctx: { ...ctx, space: next },
            msg: msg.c,
            model: gameModel,
            prev: prev.game,
            next: gameState,
          });

          return {
            model: {
              ...model,
              games: {
                ...model.games,
                [msg.spaceId]: updated.model,
              },
            },
            eff: Eff.map_(
              (c) => ({
                t: "game-msg",
                spaceId: msg.spaceId,
                c,
              }),
              updated.eff
            ),

            cmd: spaceCmdToCmd(
              next,
              SpaceServerCmd.map(updated.cmd ?? [], (c) => ({
                t: "game-msg",
                spaceId: msg.spaceId,
                c,
              }))
            ),
          };
        }
      );
    }

    default: {
      return { model };
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
  const batch: Sub<ServerMsg>[] = [];

  for (const spaceId in model.games) {
    if (!SpaceId.is(spaceId)) {
      continue;
    }

    const game = model.games[spaceId];

    if (!game) {
      continue;
    }

    const space = toStateSpace(model, spaceId);

    if (space.type === "initial") {
      continue;
    }

    if (space.type === "ended") {
      continue;
    }

    if (!space.game) {
      continue;
    }

    const sub = await GameServer.subscriptions({
      ctx: { ...ctx, space: space },
      intervalId: space.spaceId,
      model: game,
      state: space.game,
    });

    const mapped = Sub.map(
      sub,
      (c): ServerMsg => ({ t: "game-msg", c, spaceId })
    );

    batch.push(mapped);
  }

  return Sub.batch(batch);
};
