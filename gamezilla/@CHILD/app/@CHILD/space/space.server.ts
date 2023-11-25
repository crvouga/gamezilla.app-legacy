import { Eff, Sub, chain, chainAwait } from "gamezilla/@SHARED/core";
import { EventMeta, withMeta } from "gamezilla/@SHARED/event-stream";
import {
  Space,
  SpaceServerCmd,
  SpaceServerCtx,
} from "gamezilla/@CHILD/app/@CHILD/space/@SHARED";
import { SpaceId } from "gamezilla/@CHILD/app/@SHARED/data";
import {
  AnonymousReqCtx,
  ReqCtx,
  ServerCmd,
  ServerCtx,
  ServerEvt,
  broadcast,
  sendToClient,
  sendToUser,
  topicPublish,
  topicSubscribe,
} from "gamezilla/@CHILD/app/@SHARED/server";
import * as GameServer from "./@CHILD/game/game.server";
import {
  Event,
  EventWithMeta,
  ServerModel,
  ServerMsg,
  StateSpace,
  ToClient,
  ToServer,
  appendEvent,
  initCore,
  mergeModels,
  toSpaceEvents,
  toStartedSpace,
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

      const space = toStartedSpace(model, spaceId);

      if (!space || !space.game) {
        return { model };
      }

      const spaceCtx: SpaceServerCtx = {
        ...ctx,
        space: space,
      };

      const updated = await GameServer.update({
        ctx: spaceCtx,
        model: model.games[spaceId] ?? null,
        msg: msg.c,
        state: space.game,
      });

      const eventsNew =
        updated.gameEvent?.map((event) =>
          withMeta<Event>({ t: "game", spaceId, c: event })
        ) ?? [];

      return chainAwait(
        { model },
        (model) => mergeNewEvents({ ctx: spaceCtx, events: eventsNew, model }),
        (model) => mergeUpdatedGame({ model, space, updated })
      );
    }
  }
};

/**
 * Handles updating the client model from updated game model
 */
export const mergeUpdatedGame = ({
  model,
  space,
  updated,
}: {
  space: Space;
  model: ServerModel;
  updated: Awaited<ReturnType<typeof GameServer.update>>;
}): {
  model: ServerModel;
  cmd?: ServerCmd<ToClient>[];
  eff?: Eff<ServerMsg>;
} => {
  return {
    model: {
      ...model,
      games: {
        ...model.games,
        [space.spaceId]: updated.model,
      },
    },
    cmd: spaceCmdToCmd(
      space,
      SpaceServerCmd.map(updated.cmd ?? [], (c) => ({
        t: "game-msg",
        spaceId: space.spaceId,
        c,
      }))
    ),
    eff: Eff.map_(
      (c) => ({ t: "game-msg", c, spaceId: space.spaceId }),
      updated.eff
    ),
  };
};

export const updateFromClient = async (input: {
  ctx: AnonymousReqCtx;
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
      const space = toStartedSpace(model, msg.spaceId);

      if (!space || !space.game || !ctx.currentUserId) {
        return { model };
      }

      const updated = await GameServer.update({
        ctx: { ...ctx, currentUserId: ctx.currentUserId, space: space },
        state: space.game,
        clientMsg: msg.c,
        model: model.games[msg.spaceId],
      });

      const eventsNew =
        updated.gameEvent?.map((event) =>
          withMeta<Event>({ t: "game", spaceId: msg.spaceId, c: event })
        ) ?? [];

      return chainAwait(
        { model },
        (model) => {
          return mergeUpdatedGame({
            model,
            space,
            updated,
          });
        },

        (model) => {
          return mergeNewEvents({
            ctx,
            events: eventsNew,
            model,
          });
        }
      );
    }

    case "sync": {
      return chain(
        { model },
        (model) => {
          const merged = mergeModels(model, {
            events: msg.events,
            initialState: model.initialState,
          });
          return {
            model: { ...model, ...merged },
          };
        },
        (model) => {
          return {
            model: {
              ...model,
              profileCache: {
                ...model.profileCache,
                ...msg.profiles,
              },
            },
          };
        },
        (model) => {
          return {
            model,
            cmd: [
              broadcast({
                t: "sync",
                events: model.events,
                profiles: model.profileCache,
              }),
            ],
          };
        }
      );
    }

    default: {
      return chain({ model }, (model) => {
        const merged = mergeNewEvents({
          ctx,
          events: [msg],
          model,
        });
        return {
          model: { ...model, ...merged },
        };
      });
    }
  }
};

const mergeNewEvents = async (input: {
  ctx: ServerCtx;
  model: ServerModel;
  events: EventWithMeta[];
}): ReturnType<typeof update> => {
  const events = input.events.filter(
    (event) => !(event.eventId in input.model.events.events)
  );
  return chainAwait(
    input,
    // merge new events
    (model) => {
      const appended = appendEvent(model, events);
      return {
        model: { ...model, ...appended },
      };
    },
    // send to clients
    (model) => {
      const cmd = events.flatMap((event) => {
        const space = toStateSpace(model, event.spaceId);
        if (space.type === "initial" || space.type === "ended") {
          return [];
        }
        if (event.t === "game") {
          return sendToUser(Object.values(space.users), event);
        }
        return broadcast(event);
      });
      return { model, cmd };
    }
  );
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
  const { msg, model } = input;

  switch (msg.t) {
    case "wire/client-disconnected": {
      return {
        model: {
          ...model,
        },
      };
    }

    case "auth/client-authenticated": {
      const state = toStateUser(model, msg.userId);

      return {
        model,
        cmd: [
          topicSubscribe([`space/${state.spaceId}`], [msg.clientId]),
          topicSubscribe([`spaces`], [msg.clientId]),
        ],
      };
    }

    default: {
      return input;
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
