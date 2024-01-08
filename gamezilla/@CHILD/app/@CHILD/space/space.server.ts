import {
  EventId,
  WithEventId,
  withId,
} from "gamezilla/@CHILD/app/@CHILD/space/@SHARED/event";
import { Space } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED/space";
import { SpaceServerCmd } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED/space-server-cmd";
import { SpaceId } from "gamezilla/@CHILD/app/@SHARED/data";
import {
  ReqCtx,
  ServerCmd,
  ServerCtx,
  ServerEvent,
  broadcast,
  sendToClient,
  sendToUser,
} from "gamezilla/@CHILD/app/@SHARED/server";
import { Eff, Sub, batchMsgs } from "gamezilla/@SHARED/core";
import { CappedOrderedDict } from "gamezilla/@SHARED/data-structures/capped-ordered-dict";
import { AppServerModule } from "../../@SHARED/architecture/app-server";
import * as GameServer from "./@CHILD/game/game.server";
import {
  Event,
  toSpaceSubState,
  toStartedSpace,
  toUserState,
} from "./space-state";
import {
  ServerModel,
  ServerMsg,
  SpaceEvents,
  ToClient,
  ToServer,
  appendEvent,
  config,
  deriveState,
  initCore,
  mergeModels,
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
    (model) => updateChild({ ...input, model }),
    (model) => updateProfileCache({ ...input, model })
  );
};

const updateProfileCache: Module["update"] = async (input) => {
  return {
    model: {
      ...input.model,
      profileCache: {
        ...input.model.profileCache,
        ...input.fromClient?.profiles,
      },
    },
  };
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
        async (model) => {
          return {
            model,
            cmd: [
              sendToClient<ToClient>([fromClient.clientId], {
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
    case "auth/connected-client-authenticated": {
      const state = await deriveState(model);

      const userState = toUserState(state, event.userId);

      if (!userState.spaceId) {
        return { model };
      }

      return {
        model,
        cmd: [
          sendToClient<ToClient>([event.clientId], {
            t: "sync",
            clock: model.clock,
            events: model.events,
            snapshots: model.snapshots,
            spaceId: userState?.spaceId,
          }),
        ],
      };
    }

    default: {
      return { model };
    }
  }
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

const updateChild: Module["update"] = async (input) => {
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

  const eventsNew = (updated.gameEvent ?? []).map((c) =>
    withId<Event>({ t: "game", spaceId, c })
  );

  return AppServerModule.chainUpdates(
    { model },

    (model) => {
      return updateFromSpaceEvents({ ctx: spaceCtx, events: eventsNew, model });
    },

    (model) => {
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
            t: "game",
            spaceId: space.spaceId,
            causedBy: null,
            c,
          }))
        ),
        eff: Eff.map_(
          (c) => ({ t: "game", c, spaceId: space.spaceId }),
          updated.eff
        ),
      };
    }
  );
};

type Output = {
  model: ServerModel;
  cmd?: ServerCmd<ToClient>[];
  eff?: Eff<ServerMsg>;
};

const updateFromSpaceEvents = async (input: {
  ctx: ServerCtx | ReqCtx;
  model: ServerModel;
  events: WithEventId<Event>[];
}): Promise<Output> => {
  return loop(input.ctx, input.events, input);
};

async function loop(
  ctx: ServerCtx | ReqCtx,
  events: WithEventId<Event>[],
  acc: Output
): Promise<Output> {
  const [event, ...rest] = events;

  if (!event) {
    return acc;
  }

  if (event.eventId in acc.model.events._events) {
    return loop(ctx, rest, acc);
  }

  const updated = await AppServerModule.chainUpdates(
    acc,
    (model) => appendNewEvent({ model, event: event }),
    (model) => syncUserWhenJoined({ model, event: event }),
    (model) => sendEventToClients({ model, eventId: event.eventId })
  );

  const updatedGame = await updateGameFromSpaceEvent({
    ctx: ctx,
    model: updated.model,
    eventId: event.eventId,
  });

  const accNew: Output = {
    model: updatedGame.model,
    cmd: batchMsgs(acc.cmd, updated.cmd, updatedGame.cmd),
    eff: Eff.batch([acc.eff, updated.eff, updatedGame.eff]),
  };

  const eventsNew: WithEventId<Event>[] = batchMsgs(rest, updatedGame.events);

  return loop(ctx, eventsNew, accNew);
}

async function appendNewEvent({
  model,
  event,
}: {
  model: ServerModel;
  event: WithEventId<Event>;
}) {
  const appended: ServerModel = {
    ...model,
    ...(await appendEvent(model, event)),
  };
  return { model: appended };
}

async function sendEventToClients({
  model,
  eventId,
}: {
  model: ServerModel;
  eventId: EventId;
}): Promise<Output> {
  const event = await SpaceEvents.get(model.events, eventId);

  if (!event) {
    return { model };
  }

  const state = await deriveState(model);

  const space = toStartedSpace(state, event.spaceId);

  const toClient: ToClient = {
    t: "event",
    c: event,
    causedBy: event,
    clock: model.clock,
  };

  const cmd =
    event.t === "game" && space
      ? sendToUser<ToClient>(Object.values(space.users), toClient)
      : broadcast<ToClient>(toClient);

  return { model, cmd: [cmd] };
}

async function syncUserWhenJoined({
  model,
  event,
}: {
  model: ServerModel;
  event: WithEventId<Event>;
}): Promise<Output> {
  switch (event.t) {
    case "user-joined-space": {
      const state = await deriveState(model);

      const space = toStartedSpace(state, event.spaceId);

      if (!space) {
        return { model };
      }

      const events = await SpaceEvents.subset(
        config,
        model.events,
        "indexSpaceId",
        event.spaceId
      );
      const latestEvent = await SpaceEvents.latest(config, events);
      if (!latestEvent) {
        return { model };
      }
      const subState = toSpaceSubState(state, event.spaceId);
      if (!subState) {
        return { model };
      }
      const snapshots: ServerModel["snapshots"] = CappedOrderedDict.add(
        CappedOrderedDict.init({ maxSize: 5 }),
        latestEvent.eventId,
        subState
      );

      return {
        model,
        cmd: [
          sendToUser([event.userId], {
            t: "sync",
            spaceId: event.spaceId,
            events: events,
            causedBy: event,
            snapshots: snapshots,
            clock: model.clock,
          }),
        ],
      };
    }

    default: {
      return { model };
    }
  }
}

async function updateGameFromSpaceEvent({
  model,
  ctx,
  eventId,
}: {
  ctx: ServerCtx | ReqCtx;
  model: ServerModel;
  eventId: EventId;
}): Promise<{
  model: ServerModel;
  cmd?: ServerCmd<ToClient>[];
  eff?: Eff<ServerMsg>;
  events?: WithEventId<Event>[];
}> {
  const eventWithMeta = model.events._events[eventId];

  if (!eventWithMeta) {
    return { model };
  }

  const state = await deriveState(model);

  const space = toStartedSpace(state, eventWithMeta.spaceId);

  if (
    !space ||
    !space.game ||
    eventWithMeta.t !== "game" ||
    !ctx.currentUserId
  ) {
    return { model };
  }

  const updated = await GameServer.update({
    ctx: { ...ctx, currentUserId: ctx.currentUserId, space: space },
    model: model.games[eventWithMeta.spaceId],
    gameEvent: { ...eventWithMeta, ...eventWithMeta.c },
    state: space.game,
  });

  const eventsNew =
    updated.gameEvent?.map((e) =>
      withId<Event>({
        t: "game",
        spaceId: eventWithMeta.spaceId,
        c: e,
      })
    ) ?? [];

  const modelNew: ServerModel = {
    ...model,
    games: {
      ...model.games,
      [eventWithMeta.spaceId]: updated.model,
    },
  };

  return {
    model: modelNew,
    cmd: spaceCmdToCmd(
      space,
      SpaceServerCmd.map(updated.cmd ?? [], (c) => ({
        t: "game",
        spaceId: eventWithMeta.spaceId,
        causedBy: eventWithMeta,
        c,
      }))
    ),
    eff: Eff.map_(
      (c) => ({ t: "game", c, spaceId: eventWithMeta.spaceId }),
      updated.eff
    ),
    events: eventsNew,
  };
}

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
