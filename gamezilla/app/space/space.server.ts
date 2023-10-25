import { Eff, Sub, chain, chainAwait } from "gamezilla/@SHARED/core";
import {
  ReqCtx,
  ServerCmd,
  ServerCtx,
  ServerEvt,
  broadcast,
  sendToClient,
  sendToUser,
} from "gamezilla/app/@SHARED/server";
import {
  Space,
  SpaceServerCmd,
  SpaceServerCtx,
} from "gamezilla/app/space/@SHARED";
import { SpaceId } from "../@SHARED/data";
import * as GameServer from "./game/game.server";
import {
  Evt,
  ServerModel,
  ServerMsg,
  State,
  ToClient,
  ToServer,
  appendEvent,
  toState,
} from "./space.core";
import { EventMeta, withMeta } from "./@SHARED/evt";

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
      games: {},
      spaceEvents: {},
      spaceByUserId: {},
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

      const space = model.spaceEvents[spaceId];

      if (!space) {
        return { model };
      }

      const game = model.games[spaceId];

      if (!game) {
        return { model };
      }

      const state = toState(model.spaceByUserId, space);

      if (state.type === "initial") {
        return { model };
      }

      const spaceCtx: SpaceServerCtx = {
        ...ctx,
        space: state.space,
      };

      if (state.type === "ended") {
        return { model };
      }

      if (!state.game) {
        return { model };
      }

      const updated = await GameServer.update({
        ctx: spaceCtx,
        model: game,
        msg: msg.c,
        state: state.game,
      });

      const gameEvent = updated.events?.[0] ?? null;

      return chainAwait(
        model,
        (model) => {
          if (!gameEvent) {
            return { model };
          }
          return myAppendEvent(
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
              state.space,
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
      const space = model.spaceEvents[msg.spaceId];

      if (!space) {
        return { model };
      }

      const game = model.games[msg.spaceId];

      if (!game) {
        return { model };
      }

      const state = toState(model.spaceByUserId, space);

      if (state.type === "initial") {
        return { model };
      }

      if (state.type === "ended") {
        return { model };
      }

      if (!state.game) {
        return { model };
      }

      const updated = await GameServer.updateFromClient({
        ctx: { ...ctx, space: state.space },
        state: state.game,
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
          (c) => ({ t: "game-msg", spaceId: state.space.spaceId, c }),
          updated.eff
        ),
        cmd: spaceCmdToCmd(
          state.space,
          SpaceServerCmd.map(updated.cmd ?? [], (c) => ({
            t: "game-msg",
            spaceId: msg.spaceId,
            c,
          }))
        ),
      };
    }

    default: {
      const prev = toState(
        model.spaceByUserId,
        model.spaceEvents[msg.spaceId] ?? {
          events: [],
          initialState: {
            type: "initial",
          },
        }
      );

      const appended = appendEvent(model, msg);

      const next = toState(
        model.spaceByUserId,
        appended.spaceEvents[msg.spaceId] ?? {
          events: [],
          initialState: {
            type: "initial",
          },
        }
      );

      const updated = await updateGameModel({
        model,
        msg,
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
          profileCache: {
            ...model.profileCache,
            ...(msg.profile ? { [msg.profile.userId]: msg.profile } : {}),
          },
        },
        eff: updated.eff,
        cmd: [
          msg.t === "game" && next.type === "started"
            ? sendToUser(Object.values(next.space.users), msg)
            : broadcast(msg),
        ],
      };
    }
  }
};

const myAppendEvent = async (
  ctx: ServerCtx,
  model: ServerModel,
  events: Evt & EventMeta
): ReturnType<typeof update> => {
  const prev = toState(
    model.spaceByUserId,
    model.spaceEvents[events.spaceId] ?? {
      events: [],
      initialState: {
        type: "initial",
      },
    }
  );

  const appended = appendEvent(model, events);

  const next = toState(
    model.spaceByUserId,
    appended.spaceEvents[events.spaceId] ?? {
      events: [],
      initialState: {
        type: "initial",
      },
    }
  );

  const updated = await updateGameModel({
    model,
    msg: events,
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
      events.t === "game" && next.type === "started"
        ? sendToUser(Object.values(next.space.users), events)
        : broadcast(events),
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
    ...input,
    cmd: [
      sendToClient([input.msg.clientId], {
        t: "sync",
        model: {
          spaceByUserId: input.model.spaceByUserId,
          spaceEvents: input.model.spaceEvents,
        },
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
  prev: State;
  next: State;
  model: ServerModel;
  msg: Evt;
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
              space: next.space,
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
            ctx: { ...ctx, space: next.space },
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
              next.space,
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

    const space = model.spaceEvents[spaceId];

    if (!space) {
      continue;
    }

    const state = toState(model.spaceByUserId, space);

    if (state.type === "initial") {
      continue;
    }

    if (state.type === "ended") {
      continue;
    }

    if (!state.game) {
      continue;
    }

    const sub = await GameServer.subscriptions({
      ctx: { ...ctx, space: state.space },
      intervalId: state.space.spaceId,
      model: game,
      state: state.game,
    });

    const mapped = Sub.map(
      sub,
      (c): ServerMsg => ({ t: "game-msg", c, spaceId })
    );

    batch.push(mapped);
  }

  return Sub.batch(batch);
};
