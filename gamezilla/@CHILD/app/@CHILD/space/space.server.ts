import { withId } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED/event";
import { SpaceServerCtx } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED/space";
import { SpaceId } from "gamezilla/@CHILD/app/@SHARED/data";
import {
  ServerCmd,
  ServerCtx,
  ServerEvt,
  broadcast,
  sendToClient,
  topicSubscribe,
} from "gamezilla/@CHILD/app/@SHARED/server";
import { Sub } from "gamezilla/@SHARED/core";
import { ServerModule } from "../../@SHARED/architecture/app-server";
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
  toState,
  toUserState,
} from "./space.core";

//
//
//
//
//
//
//

type Module = ServerModule<{
  Ctx: ServerCtx;
  InCmd: null;
  InEvt: ServerEvt;
  Model: ServerModel;
  Msg: ServerMsg;
  OutCmd: ServerCmd<ToClient>;
  OutEvt: null;
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

export const init: Module["init"] = async () => {
  const core = initCore();
  return {
    model: {
      ...core,
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

export const update: Module["update"] = async ({
  model,
  msg,
  evt,
  fromClient,
  ctx,
}) => {
  if (msg) {
    return updateFromMsg({
      ctx,
      model,
      msg,
    });
  }

  if (fromClient) {
    return updateFromClient({
      ctx,
      model,
      fromClient,
    });
  }

  if (evt) {
    return updateFromEvt({
      ctx,
      model,
      evt,
    });
  }

  return { model };
};

const updateFromMsg: Module["update"] = async ({ model, msg, ctx }) => {
  if (!msg) {
    return { model };
  }
  switch (msg.t) {
    case "game": {
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
          withId<Event>({ t: "game", spaceId, c: event })
        ) ?? [];

      return ServerModule.chainUpdates(
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

const updateFromClient: Module["update"] = async (input) => {
  const { fromClient, model, ctx } = input;

  if (!fromClient) {
    return { model };
  }

  switch (fromClient.t) {
    case "game": {
      const space = toStartedSpace(model, fromClient.spaceId);

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
        clientMsg: fromClient.c,
        model: model.games[fromClient.spaceId],
      });

      const eventsNew =
        updated.gameEvent?.map((event) =>
          withId<Event>({ t: "game", spaceId: fromClient.spaceId, c: event })
        ) ?? [];

      return ServerModule.chainUpdates(
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
      return ServerModule.chainUpdates(
        { model },
        (model) => {
          const merged = mergeModels(model, {
            events: fromClient.events,
            initialState: model.initialState,
            clock: model.clock,
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
                ...fromClient.profiles,
              },
            },
          };
        },
        (model) => {
          return {
            model,
            cmd: [
              broadcast<ToClient>({
                t: "sync",
                events: model.events,
                causedBy: fromClient,
                profiles: model.profileCache,
                clock: model.clock,
              }),
            ],
          };
        }
      );
    }

    case "event": {
      const updated = await updateFromEvents({
        ctx: ctx,
        events: [fromClient.c],
        model,
      });

      return updated;
    }
  }
};

const updateFromEvt: Module["update"] = async (input) => {
  const { evt, model } = input;

  if (!evt) {
    return { model };
  }

  switch (evt.t) {
    case "auth/connected-client-authenticated": {
      const state = toUserState(model, evt.userId);

      return {
        model,
        cmd: [
          sendToClient([evt.clientId], {
            t: "sync",
            causedBy: evt,
            events: model.events,
            clock: model.clock,
          }),
          topicSubscribe([`space/${state.spaceId}`], [evt.clientId]),
          topicSubscribe([`spaces`], [evt.clientId]),
        ],
      };
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

export const subscriptions: Module["subscriptions"] = async ({
  model,
  ctx,
}) => {
  const batch: Sub<ServerMsg>[] = [];

  const state = toState(model);

  for (const spaceId in state.active) {
    if (!SpaceId.is(spaceId)) {
      continue;
    }

    const space = toStartedSpace(model, spaceId);

    if (!space?.game) {
      continue;
    }

    const sub = await GameServer.subscriptions({
      ctx: { ...ctx, space: space },
      intervalId: space.spaceId,
      model: model.games[spaceId],
      state: space.game,
    });

    const mapped = Sub.map(sub, (c): ServerMsg => ({ t: "game", c, spaceId }));

    batch.push(mapped);
  }

  return Sub.batch(batch);
};
