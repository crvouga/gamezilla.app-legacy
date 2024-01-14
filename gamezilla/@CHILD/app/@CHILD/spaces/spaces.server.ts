import {
  WithEventId,
  withId,
} from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event";
import { SpaceServerCmd } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space-server-cmd";
import { SpaceId } from "gamezilla/@CHILD/app/@SHARED/data";
import {
  ReqCtx,
  ServerCmd,
  ServerCtx,
  ServerEvent,
  broadcast,
  sendBack,
  sendToClient,
  sendToUser,
} from "gamezilla/@CHILD/app/@SHARED/server";
import { Eff, Sub, batchMsgs } from "gamezilla/@SHARED/core";
import { AppServerModule } from "../../@SHARED/architecture/app-server";
import { Game } from "./@CHILD/game/game.server";
import * as Space from "./spaces-core/space";
import { SpaceEvent } from "./spaces-core/space-event";
import * as SpaceState from "./spaces-core/space-state";
import * as Spaces from "./spaces-core/spaces";
import { ServerModel, ServerMsg, ToClient, ToServer } from "./spaces.core";

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

const spacesToProfiles = (
  model: ServerModel,
  spaces: Space.Model[]
): ServerModel["profileCache"] => {
  const profiles: ServerModel["profileCache"] = {};

  for (const space of spaces) {
    for (const userId of Space.toUserIds(space)) {
      const profile = model.profileCache[userId];
      if (profile) {
        profiles[userId] = profile;
      }
    }
  }

  return profiles;
};

//
//
//
// Model
//
//
//

export const init: Module["init"] = async () => {
  return {
    model: {
      ...Spaces.init,
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

    case "event": {
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

    case "event": {
      const updated = await updateFromSpaceEvents({
        ctx: ctx,
        events: [fromClient.c],
        model,
      });

      return updated;
    }

    case "list-spaces": {
      const spaces = Spaces.listSpaces({
        model,
        limit: fromClient.limit,
        offset: fromClient.offset,
        where: fromClient.where,
      });

      const profiles = spacesToProfiles(model, spaces);

      return {
        model,
        cmd: [
          sendBack(fromClient, {
            t: "listed-spaces",
            spaces,
            profiles,
            causedBy: fromClient.t,
          }),
        ],
      };
    }

    case "sync": {
      return AppServerModule.chainUpdates(
        { model },
        (model) => {
          const merged = Spaces.mergeOne({ model, space: fromClient.space });

          return {
            model: {
              games: model.games,
              profileCache: model.profileCache,
              spaceIdByUserId: merged.spaceIdByUserId,
              spaces: merged.spaces,
            },
          };
        },
        (model) => {
          const spaceId = Space.toSpaceId(fromClient.space);

          if (!spaceId) {
            return { model };
          }

          const spaceNew = Spaces.toSpace(model, spaceId);

          if (!spaceNew) {
            return { model };
          }

          const profiles = spacesToProfiles(model, [spaceNew]);

          return {
            model,
            cmd: [
              sendToClient<ToClient>([fromClient.clientId], {
                t: "synced",
                causedBy: fromClient.t,
                space: spaceNew,
                profiles: profiles,
              }),
            ],
          };
        }
      );
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
      const space = Spaces.toSpaceByUserId({
        model,
        userId: event.userId,
      });

      if (!space) {
        return { model };
      }

      const profiles = spacesToProfiles(model, [space]);

      return {
        model,
        cmd: [
          sendToClient<ToClient>([event.clientId], {
            t: "current-user-space",
            space,
            profiles,
            causedBy: event.t,
          }),
        ],
      };
    }

    default: {
      return { model };
    }
  }
};

const spaceCmdToCmd = (
  spaceState: SpaceState.State,
  cmd?: SpaceServerCmd<ToClient>[]
) => {
  return cmd?.map((cmd): ServerCmd<ToClient> => {
    switch (cmd.t) {
      case "send-to-space": {
        return sendToUser(SpaceState.toUserIds(spaceState), cmd.msg);
      }

      default: {
        return cmd;
      }
    }
  });
};

const inputToSpaceId = (input: Parameters<Module["update"]>[0]) => {
  const spaceId =
    input.msg && "spaceId" in input.msg
      ? input.msg.spaceId
      : input.fromClient && "spaceId" in input.fromClient
      ? input.fromClient.spaceId
      : null;

  return spaceId;
};

const updateChild: Module["update"] = async (input) => {
  const { msg, event, fromClient, ctx, model } = input;

  const spaceId = inputToSpaceId(input);

  if (!spaceId) {
    return { model };
  }

  const spaceState = Spaces.toSpaceStarted(model, spaceId);

  if (!spaceState) {
    return { model };
  }

  if (!spaceState.game) {
    return { model };
  }

  const gameUpdated = await Game.update({
    ctx: { ...ctx, space: spaceState },
    model: model.games[spaceId] ?? null,
    msg: msg?.t === "game" ? msg.c : null,
    clientMsg: fromClient?.t === "game" ? fromClient.c : null,
    event,
    state: spaceState.game,
  });

  const eventsNew = (gameUpdated.gameEvent ?? []).map((c) =>
    withId<SpaceEvent>({ t: "game", spaceId, c })
  );

  return AppServerModule.chainUpdates(
    { model },
    (model) => mergeUpdatedGame({ model, spaceId, gameUpdated }),
    (model) => updateFromSpaceEvents({ model, ctx, events: eventsNew })
  );
};

const mergeUpdatedGame = ({
  model,
  spaceId,
  gameUpdated,
}: {
  spaceId: SpaceId;
  model: ServerModel;
  gameUpdated: Awaited<ReturnType<typeof Game.update>>;
}): {
  model: ServerModel;
  cmd?: ServerCmd<ToClient>[];
  eff?: Eff<ServerMsg>;
} => {
  const spaceState = Spaces.toSpaceState(model, spaceId);
  return {
    model: {
      ...model,
      games: {
        ...model.games,
        [spaceId]: gameUpdated.model,
      },
    },
    cmd: spaceCmdToCmd(
      spaceState,
      SpaceServerCmd.map(gameUpdated.cmd, (c) => ({
        t: "game",
        spaceId,
        c,
      }))
    ),
    eff: Eff.map_((c) => ({ t: "game", c, spaceId }), gameUpdated.eff),
  };
};

type Acc = {
  model: ServerModel;
  cmd?: ServerCmd<ToClient>[];
  eff?: Eff<ServerMsg>;
};

const updateFromSpaceEvents = async (input: {
  ctx: ServerCtx | ReqCtx;
  model: ServerModel;
  events: WithEventId<SpaceEvent>[];
}): Promise<Acc> => {
  return updateFromSpaceEventsLoop(input.ctx, input.events, input);
};

const updateFromSpaceEventsLoop = async (
  ctx: ServerCtx | ReqCtx,
  spaceEvents: WithEventId<SpaceEvent>[],
  acc: Acc
): Promise<Acc> => {
  const [spaceEvent, ...spaceEventsRest] = spaceEvents;

  if (!spaceEvent) {
    return acc;
  }

  const spaceModel =
    Spaces.toSpace(acc.model, spaceEvent.spaceId) ?? Space.init;

  if (!spaceModel) {
    return updateFromSpaceEventsLoop(ctx, spaceEventsRest, acc);
  }

  if (Space.hasEvent(spaceModel, spaceEvent.eventId)) {
    return updateFromSpaceEventsLoop(ctx, spaceEventsRest, acc);
  }

  const updated = await AppServerModule.chainUpdates(
    acc,
    (model) => updateFromSpaceEvent({ model, spaceEvent }),
    (model) => updateGameFromSpaceEvent({ ctx, model, spaceEvent }),
    (model) => Spaces.updateFromSpaceEvent({ model, spaceEvent }),
    (model) => sendEventToClients({ model, spaceEvent })
  );

  const accNew: Acc = {
    model: updated.model,
    cmd: batchMsgs(acc.cmd, updated.cmd),
    eff: Eff.batch([acc.eff, updated.eff]),
  };

  const eventsNew: WithEventId<SpaceEvent>[] = batchMsgs(
    spaceEventsRest,
    updated.event ?? []
  );

  return updateFromSpaceEventsLoop(ctx, eventsNew, accNew);
};

const sendEventToClients = async ({
  model,
  spaceEvent,
}: {
  model: ServerModel;
  spaceEvent: WithEventId<SpaceEvent>;
}): Promise<Acc> => {
  const eventWithMeta = Spaces.toEventWithMeta(
    model,
    spaceEvent.spaceId,
    spaceEvent.eventId
  );

  if (!eventWithMeta) {
    return { model };
  }

  const spaceState = Spaces.toSpaceStarted(model, eventWithMeta.spaceId);

  const profile =
    "userId" in eventWithMeta ? model.profileCache[eventWithMeta.userId] : null;

  const toClient: ToClient = {
    t: "event",
    c: eventWithMeta,
    profiles: profile ? { [profile.userId]: profile } : {},
  };

  if (spaceState && eventWithMeta.t === "game") {
    return {
      model,
      cmd: [sendToUser<ToClient>(SpaceState.toUserIds(spaceState), toClient)],
    };
  }

  return {
    model,
    cmd: [broadcast<ToClient>(toClient)],
  };
};

const updateFromSpaceEvent = async ({
  model,
  spaceEvent,
}: {
  model: ServerModel;
  spaceEvent: WithEventId<SpaceEvent>;
}): Promise<Acc> => {
  switch (spaceEvent.t) {
    case "user-joined-space": {
      const space = Spaces.toSpace(model, spaceEvent.spaceId);

      if (!space) {
        return { model };
      }

      return {
        model,
        cmd: [
          sendToUser([spaceEvent.userId], {
            t: "listed-spaces",
            spaces: [space],
            causedBy: spaceEvent.t,
          }),
        ],
      };
    }

    default: {
      return { model };
    }
  }
};

const updateGameFromSpaceEvent = async ({
  model,
  ctx,
  spaceEvent,
}: {
  ctx: ServerCtx | ReqCtx;
  model: ServerModel;
  spaceEvent: WithEventId<SpaceEvent>;
}): Promise<{
  model: ServerModel;
  cmd?: ServerCmd<ToClient>[];
  eff?: Eff<ServerMsg>;
  events?: WithEventId<SpaceEvent>[];
}> => {
  if (!ctx.currentUserId) {
    return { model };
  }

  const eventWithMeta = Spaces.toEventWithMeta(
    model,
    spaceEvent.spaceId,
    spaceEvent.eventId
  );

  if (!eventWithMeta) {
    return { model };
  }

  if (eventWithMeta.t !== "game") {
    return { model };
  }

  const spaceState = Spaces.toSpaceStarted(model, eventWithMeta.spaceId);

  if (!spaceState) {
    return { model };
  }

  if (!spaceState.game) {
    return { model };
  }

  const updated = await Game.update({
    ctx: { ...ctx, currentUserId: ctx.currentUserId, space: spaceState },
    model: model.games[eventWithMeta.spaceId],
    gameEvent: { ...eventWithMeta, ...eventWithMeta.c },
    state: spaceState.game,
  });

  const eventsNew = (updated.gameEvent ?? []).map((e) =>
    withId<SpaceEvent>({ t: "game", spaceId: eventWithMeta.spaceId, c: e })
  );

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
      spaceState,
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

  for (const spaceId in model.spaces) {
    const spaceState = Spaces.toSpaceStarted(model, spaceId as SpaceId);

    if (!spaceState) {
      continue;
    }

    if (!spaceState.game) {
      continue;
    }

    const sub = await Game.subscriptions({
      ctx: { ...ctx, space: spaceState },
      intervalId: spaceId,
      model: model.games[spaceId as SpaceId],
      state: spaceState.game,
    });

    const mapped = Sub.map(
      sub,
      (c): ServerMsg => ({ t: "game", c, spaceId: spaceId as SpaceId })
    );

    batch.push(mapped);
  }

  return Sub.batch(batch);
};
