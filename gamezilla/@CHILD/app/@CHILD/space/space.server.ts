import { SpaceServerCtx } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED";
import { SpaceId } from "gamezilla/@CHILD/app/@SHARED/data";
import {
  AnonymousReqCtx,
  ServerCmd,
  ServerCtx,
  ServerEvt,
  broadcast,
  topicSubscribe,
} from "gamezilla/@CHILD/app/@SHARED/server";
import { Eff, Sub, chain, chainAwait } from "gamezilla/@SHARED/core";
import { withMeta } from "gamezilla/@SHARED/event-stream";
import * as GameServer from "./@CHILD/game/game.server";
import { updateFromEvents } from "./space-server/update-from-events";
import { updateFromGame } from "./space-server/update-from-game";
import {
  Event,
  ServerModel,
  ServerMsg,
  ToClient,
  ToServer,
  initCore,
  mergeModels,
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
        (model) => {
          return updateFromEvents({ ctx: spaceCtx, events: eventsNew, model });
        },
        (model) => {
          return updateFromGame({ model, space, updated });
        }
      );
    }
  }
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

      const spaceCtx = {
        ...ctx,
        currentUserId: ctx.currentUserId,
        space: space,
      };

      const updated = await GameServer.update({
        ctx: spaceCtx,
        state: space.game,
        clientMsg: msg.c,
        model: model.games[msg.spaceId],
      });

      console.log("input", input, "updated", updated);

      const eventsNew =
        updated.gameEvent?.map((event) =>
          withMeta<Event>({ t: "game", spaceId: msg.spaceId, c: event })
        ) ?? [];

      return chainAwait(
        { model },
        (model) => {
          return updateFromGame({
            model,
            space,
            updated,
          });
        },

        (model) => {
          return updateFromEvents({
            ctx: spaceCtx,
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
      const space = toStartedSpace(model, msg.spaceId);

      if (!space || !space.game || !ctx.currentUserId) {
        return { model };
      }

      const spaceCtx = {
        ...ctx,
        currentUserId: ctx.currentUserId,
        space: space,
      };

      return updateFromEvents({
        ctx: spaceCtx,
        events: [msg],
        model,
      });
    }
  }
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

    case "auth/connected-client-authenticated": {
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
