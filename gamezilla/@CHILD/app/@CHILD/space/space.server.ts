import { withId } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED/event";
import { SpaceId } from "gamezilla/@CHILD/app/@SHARED/data";
import {
  ServerCmd,
  ServerCtx,
  ServerEvent,
  broadcast,
  topicSubscribe,
} from "gamezilla/@CHILD/app/@SHARED/server";
import { Sub } from "gamezilla/@SHARED/core";
import { AppServerModule } from "../../@SHARED/architecture/app-server";
import * as GameServer from "./@CHILD/game/game.server";
import { updateFromSpaceEvents } from "./space-server/update-from-events";
import { updateFromGame } from "./space-server/update-from-game";
import {
  Event,
  toStartedSpace,
  toUserState
} from './space-state';
import {
  ServerModel,
  ServerMsg,
  ToClient,
  ToServer,
  deriveState,
  initCore,
  mergeModels
} from "./space.core";

//
//
//
//
//
//
//

type Module = AppServerModule<{
  Ctx: ServerCtx;
  InCmd: null;
  InEvent: ServerEvent;
  Model: ServerModel;
  Msg: ServerMsg;
  OutCmd: ServerCmd<ToClient>;
  OutEvent: null;
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
  const core = await initCore();
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

export const update: Module["update"] = async (input) => {
  return AppServerModule.chainUpdates(
    { model: input.model },
    (model) => updateFromMsg({ ...input, model }),
    (model) => updateFromClient({ ...input, model }),
    (model) => updateFromEvent({ ...input, model }),
    (model) => updateGame({ ...input, model })
  );
};

const updateFromMsg: Module["update"] = async ({ model, msg }) => {
  if (!msg) {
    return { model };
  }

  switch (msg.t) {
    case "game": {
      return { model };
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
      return { model };
    }

    case "sync": {
      return AppServerModule.chainUpdates(
        { model },
        async (model) => {
          const merged = await mergeModels(model, {
            events: fromClient.events,
            clock: fromClient.clock,
            snapshots: fromClient.snapshots,
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
        async (model) => {
          return {
            model,
            cmd: [
              broadcast<ToClient>({
                t: "sync",
                spaceId: fromClient.spaceId,
                events: model.events,
                clock: model.clock,
                snapshots: model.snapshots,
                causedBy: fromClient,
                profiles: model.profileCache,
              }),
            ],
          };
        }
      );
    }

    case "event": {
      const updated = await updateFromSpaceEvents({
        ctx: ctx,
        events: [fromClient.c],
        model,
      });

      return updated;
    }
  }
};

const updateFromEvent: Module["update"] = async (input) => {
  const { event, model } = input;

  if (!event) {
    return { model };
  }

  switch (event.t) {
    case "auth/connected-client-is-logged-in": {
      const state = await deriveState(model);
      const userState = toUserState(state, event.userId);

      return {
        model,
        cmd: [
          topicSubscribe([`space/${userState.spaceId}`], [event.clientId]),
          topicSubscribe([`spaces`], [event.clientId]),
        ],
      };
    }

    default: {
      return { model };
    }
  }
};

const updateGame: Module["update"] = async (input) => {
  const { msg, event, fromClient, ctx, model } = input;

  const spaceId =
    msg && "spaceId" in msg
      ? msg.spaceId
      : fromClient && "spaceId" in fromClient
      ? fromClient.spaceId
      : null;

  if (!spaceId) {
    return { model };
  }

  const state = await deriveState(model);

  const space = toStartedSpace(state, spaceId);

  if (!space || !space.game) {
    return { model };
  }

  const spaceCtx = {
    ...ctx,
    space: space,
  };

  const updated = await GameServer.update({
    ctx: spaceCtx,
    model: model.games[spaceId] ?? null,
    msg: msg?.t === "game" ? msg.c : null,
    clientMsg: fromClient?.t === "game" ? fromClient.c : null,
    event,
    state: space.game,
  });

  const eventsNew =
    updated.gameEvent?.map((event) =>
      withId<Event>({ t: "game", spaceId, c: event })
    ) ?? [];

  return AppServerModule.chainUpdates(
    { model },
    (model) =>
      updateFromSpaceEvents({ ctx: spaceCtx, events: eventsNew, model }),
    (model) => updateFromGame({ model, space, updated })
  );
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

  const state = await deriveState(model);

  for (const spaceId in state.active) {
    if (!SpaceId.is(spaceId)) {
      continue;
    }

    const space = toStartedSpace(state, spaceId);

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
