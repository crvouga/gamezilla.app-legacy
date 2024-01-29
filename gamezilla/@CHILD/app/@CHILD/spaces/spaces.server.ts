import {
  WithEventId,
  withId,
} from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event";
import { SpaceServerCmd } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space-server-cmd";
import { SpaceId } from "gamezilla/@CHILD/app/@SHARED/data";
import {
  ServerCmd,
  ServerCtx,
  ServerEvent,
  broadcast,
  sendBack,
  sendMsgToClient,
  sendToUser,
} from "gamezilla/@CHILD/app/@SHARED/server";
import { Eff, Sub, batchMsgs } from "gamezilla/@SHARED/core";
import { AppServerModule } from "../../@SHARED/architecture/app-server";
import { Game } from "./@CHILD/game/game.server";
import * as Space from "./spaces-core/space";
import { SpaceEvent } from "./spaces-core/space-event";
import * as SpaceState from "./spaces-core/space-state";
import * as Spaces from "./spaces-core/spaces";
import {
  ServerModel,
  ServerMsg,
  MsgToClient,
  MsgToServer,
} from "./spaces.core";

//
//
//
//
//
//
//

type Module = AppServerModule<{
  Ctx: ServerCtx;
  MsgInCmd: null;
  MsgInEvent: ServerEvent;
  Model: ServerModel;
  Msg: ServerMsg;
  MsgOutCmd: ServerCmd<MsgToClient>;
  MsgOutEvent: null;
  MsgToClient: MsgToClient;
  MsgToServer: MsgToServer;
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
    (model) => updateProfileCache({ ...input, model }),
    (model) => updateFromMsg({ ...input, model }),
    (model) => updateFromClient({ ...input, model }),
    (model) => updateFromEvent({ ...input, model }),
    (model) => updateChild({ ...input, model })
  );
};

const updateProfileCache: Module["update"] = async (input) => {
  return {
    model: {
      ...input.model,
      profileCache: {
        ...input.model.profileCache,
        ...input.msgFromClient?.profiles,
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

    case "msgEvt": {
      return { model };
    }
  }
};

const updateFromClient: Module["update"] = async (input) => {
  const { msgFromClient, model, ctx } = input;

  if (!msgFromClient) {
    return { model };
  }

  switch (msgFromClient.t) {
    case "game": {
      return { model };
    }

    case "msgEvt": {
      return updateFromManySpaceEvents({
        ctx: ctx,
        msgEvts: [msgFromClient.c],
        model,
      });
    }

    case "list-spaces": {
      const spaces = Spaces.listSpaces({
        model,
        limit: msgFromClient.limit,
        offset: msgFromClient.offset,
        where: msgFromClient.where,
      });

      const profiles = spacesToProfiles(model, spaces);

      const started = spaces.map((space) =>
        Space.startFromLatestSnapshot(space)
      );

      return {
        model,
        msgCmd: [
          sendBack(msgFromClient, {
            t: "listed-spaces",
            spaces: started,
            profiles,
            causedBy: msgFromClient.t,
          }),
        ],
      };
    }

    case "sync": {
      return AppServerModule.chainUpdates(
        { model },
        (model) => {
          const merged = Spaces.mergeOne({ model, space: msgFromClient.space });

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
          const spaceId = Space.toSpaceId(msgFromClient.space);

          if (!spaceId) {
            return { model };
          }

          const spaceNew = Spaces.toSpace(model, spaceId);

          if (!spaceNew) {
            return { model };
          }

          const profiles = spacesToProfiles(model, [spaceNew]);

          const starting = Space.startFromLatestSnapshot(spaceNew);

          return {
            model,
            msgCmd: [
              sendMsgToClient<MsgToClient>([msgFromClient.clientId], {
                t: "synced",
                causedBy: msgFromClient.t,
                space: starting,
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
  const { msgEvt, model } = input;

  if (!msgEvt) {
    return { model };
  }

  switch (msgEvt.t) {
    case "auth/client-authenticated": {
      const space = Spaces.toSpaceByUserId({
        model,
        userId: msgEvt.userId,
      });

      if (!space) {
        return { model };
      }

      const profiles = spacesToProfiles(model, [space]);

      const started = Space.startFromLatestSnapshot(space);

      return {
        model,
        msgCmd: [
          sendMsgToClient<MsgToClient>([msgEvt.clientId], {
            t: "current-user-space",
            space: started,
            profiles,
            causedBy: msgEvt.t,
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
  msgCmd?: SpaceServerCmd<MsgToClient>[]
) => {
  return msgCmd?.map((msgCmd): ServerCmd<MsgToClient> => {
    switch (msgCmd.t) {
      case "send-to-space": {
        return sendToUser(SpaceState.toUserIds(spaceState), msgCmd.msg);
      }

      default: {
        return msgCmd;
      }
    }
  });
};

const inputToSpaceId = (input: Parameters<Module["update"]>[0]) => {
  const spaceId =
    input.msg && "spaceId" in input.msg
      ? input.msg.spaceId
      : input.msgFromClient && "spaceId" in input.msgFromClient
      ? input.msgFromClient.spaceId
      : null;

  return spaceId;
};

const updateChild: Module["update"] = async (input) => {
  const { msg, msgEvt, msgFromClient, ctx, model } = input;

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

  if (msgFromClient && !msgFromClient.userId) {
    ctx.logger.warn("msgFromClient is missing userId");
  }

  const gameUpdated = await Game.update({
    ctx: { ...ctx, space: spaceState },
    model: model.games[spaceId] ?? Game.init(spaceState.game.t),
    msg: msg?.t === "game" ? msg.c : null,
    msgFromClient:
      msgFromClient?.t === "game" && msgFromClient.userId
        ? { ...msgFromClient, userId: msgFromClient.userId, ...msgFromClient.c }
        : null,
    msgEvt,
    modelGame: spaceState.game,
    deps: null,
  });

  const merged = mergeUpdatedGame({ model, spaceId, gameUpdated });

  return AppServerModule.chainUpdates(merged, (model) =>
    updateFromManySpaceEvents({ model, ctx, msgEvts: merged.spaceEvents })
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
  msgCmd: ServerCmd<MsgToClient>[];
  eff: Eff<ServerMsg>;
  spaceEvents: WithEventId<SpaceEvent>[];
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
    msgCmd:
      spaceCmdToCmd(
        spaceState,
        SpaceServerCmd.map(gameUpdated.msgCmd, (c) => ({
          t: "game",
          spaceId,
          c,
        }))
      ) ?? [],
    eff: Eff.map_((c) => ({ t: "game", c, spaceId }), gameUpdated.eff),
    spaceEvents:
      gameUpdated.msgGame?.map((c) =>
        withId<SpaceEvent>({ t: "game", spaceId, c })
      ) ?? [],
  };
};

type Acc = {
  model: ServerModel;
  msgCmd?: ServerCmd<MsgToClient>[];
  eff?: Eff<ServerMsg>;
};

const updateFromManySpaceEvents = async (input: {
  ctx: ServerCtx;
  model: ServerModel;
  msgEvts: WithEventId<SpaceEvent>[];
}): Promise<Acc> => {
  return updateFromManySpaceEventsLoop(input.ctx, input.msgEvts, input);
};

const updateFromManySpaceEventsLoop = async (
  ctx: ServerCtx,
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
    return updateFromManySpaceEventsLoop(ctx, spaceEventsRest, acc);
  }

  if (Space.hasEvent(spaceModel, spaceEvent.eventId)) {
    return updateFromManySpaceEventsLoop(ctx, spaceEventsRest, acc);
  }

  const updated = await AppServerModule.chainUpdates(
    acc,
    (model) => Spaces.updateFromSpaceEvent({ model, spaceEvent }),
    (model) => updateFromSpaceEvent({ model, spaceEvent, ctx }),
    (model) => sendEventMsgToClients({ model, spaceEvent })
  );

  const accNew: Acc = {
    model: updated.model,
    msgCmd: batchMsgs(acc.msgCmd, updated.msgCmd),
    eff: Eff.batch([acc.eff, updated.eff]),
  };

  const msgEvtsNew: WithEventId<SpaceEvent>[] = batchMsgs(
    spaceEventsRest,
    updated.msgEvt ?? []
  );

  return updateFromManySpaceEventsLoop(ctx, msgEvtsNew, accNew);
};

const sendEventMsgToClients = async ({
  model,
  spaceEvent,
}: {
  model: ServerModel;
  spaceEvent: WithEventId<SpaceEvent>;
}): Promise<Acc> => {
  const msgEvtWithMeta = Spaces.toEventWithMeta(
    model,
    spaceEvent.spaceId,
    spaceEvent.eventId
  );

  if (!msgEvtWithMeta) {
    return { model };
  }

  const spaceState = Spaces.toSpaceStarted(model, msgEvtWithMeta.spaceId);

  const profile =
    "userId" in msgEvtWithMeta
      ? model.profileCache[msgEvtWithMeta.userId]
      : null;

  const toClient: MsgToClient = {
    t: "msgEvt",
    c: msgEvtWithMeta,
    profiles: profile ? { [profile.userId]: profile } : {},
  };

  if (spaceState && msgEvtWithMeta.t === "game") {
    return {
      model,
      msgCmd: [
        sendToUser<MsgToClient>(SpaceState.toUserIds(spaceState), toClient),
      ],
    };
  }

  return {
    model,
    msgCmd: [broadcast<MsgToClient>(toClient)],
  };
};

const updateFromSpaceEvent = async ({
  model,
  spaceEvent,
  ctx,
}: {
  ctx: ServerCtx;
  model: ServerModel;
  spaceEvent: WithEventId<SpaceEvent>;
}): Promise<{
  model: ServerModel;
  eff?: Eff<ServerMsg>;
  msgCmd?: ServerCmd<MsgToClient>[];
  spaceEvents?: WithEventId<SpaceEvent>[];
}> => {
  switch (spaceEvent.t) {
    case "user-joined-space": {
      const space = Spaces.toSpace(model, spaceEvent.spaceId);
      console.log("user-joined-space", spaceEvent.spaceId);

      if (!space) {
        console.log("no space");
        return { model };
      }

      const started = Space.startFromLatestSnapshot(space);

      return {
        model,
        msgCmd: [
          sendToUser([spaceEvent.userId], {
            t: "synced",
            space: started,
            causedBy: spaceEvent.t,
          }),
        ],
      };
    }

    case "game": {
      const msgEvtWithMeta = Spaces.toEventWithMeta(
        model,
        spaceEvent.spaceId,
        spaceEvent.eventId
      );

      if (!msgEvtWithMeta) {
        return { model };
      }

      if (msgEvtWithMeta.t !== "game") {
        return { model };
      }

      const spaceState = Spaces.toSpaceStarted(model, msgEvtWithMeta.spaceId);

      if (!spaceState) {
        return { model };
      }

      if (!spaceState.game) {
        return { model };
      }

      const gameUpdated = await Game.update({
        ctx: { ...ctx, space: spaceState },
        model:
          model.games[msgEvtWithMeta.spaceId] ?? Game.init(spaceState.game.t),
        msgGame: { ...msgEvtWithMeta, ...msgEvtWithMeta.c },
        modelGame: spaceState.game,
        deps: null,
      });

      const merged = mergeUpdatedGame({
        gameUpdated,
        model,
        spaceId: msgEvtWithMeta.spaceId,
      });

      return merged;
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
      model: model.games[spaceId as SpaceId] ?? Game.init(spaceState.game.t),
      modelGame: spaceState.game,
    });

    const mapped = Sub.map(
      sub,
      (c): ServerMsg => ({ t: "game", c, spaceId: spaceId as SpaceId })
    );

    batch.push(mapped);
  }

  return Sub.batch(batch);
};
