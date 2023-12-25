import {
  EventId,
  WithEventId,
  withId,
} from "gamezilla/@CHILD/app/@CHILD/space/@SHARED/event";
import { AppClientModule } from "gamezilla/@CHILD/app/@SHARED/architecture/app-client";
import {
  APP_SOUND,
  AnonymousClientCtx,
  ClientCmd,
  ClientCtx,
  playSound,
  pushRoute,
  sendToServer,
  showToast,
} from "gamezilla/@CHILD/app/@SHARED/client";
import { Eff, batchMsgs } from "gamezilla/@SHARED/core";
import { Game } from "../@CHILD/game/game.client";
import {
  Event,
  SpaceStateStarted,
  State,
  toStartedSpace,
  toUserState,
} from '../space-state';
import {
  ClientModel,
  ClientMsg,
  SpaceEvents,
  ToServer,
  appendEvent,
  deriveState,
} from "../space.core";

/**
 * Handles merging new events into the client model
 */
export function updateFromSpaceEvents(input: {
  ctx: ClientCtx | AnonymousClientCtx;
  model: ClientModel;
  events: WithEventId<Event>[];
}): Promise<{
  model: ClientModel;
  eff?: Eff<ClientMsg>;
  cmd?: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>[];
}> {
  return loop(input.ctx, input.events, {
    model: input.model,
    cmd: [],
    eff: Eff.None,
  });
}

async function loop(
  ctx: ClientCtx | AnonymousClientCtx,
  events: WithEventId<Event>[],
  acc: {
    model: ClientModel;
    cmd?: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>[];
    eff?: Eff<ClientMsg>;
  }
): Promise<{
  model: ClientModel;
  cmd?: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>[];
  eff?: Eff<ClientMsg>;
}> {
  const [event, ...rest] = events;

  if (!event) {
    return acc;
  }

  if (await SpaceEvents.has(acc.model.events, event.eventId)) {
    return loop(ctx, rest, acc);
  }

  const stateBefore = await deriveState(acc.model);
  const spaceBefore = toStartedSpace(stateBefore, event.spaceId);

  const updated = await AppClientModule.chainUpdates(
    acc,
    (model) => appendEvents({ model, event }),
    (model) => updateSpaceFromEvent({ stateBefore, model, ctx, event }),
    (model) => sendEventToServer({ model, eventId: event.eventId })
  );

  const spaceAfter = toStartedSpace(
    await deriveState(updated.model),
    event.spaceId
  );

  const updatedGame = await updateGameFromEvent({
    model: updated.model,
    ctx,
    eventId: event.eventId,
    before: spaceBefore,
    after: spaceAfter,
  });

  const accNew: typeof acc = {
    model: updatedGame.model,
    cmd: batchMsgs(acc.cmd, updatedGame.cmd, updated.cmd),
    eff: Eff.batch([acc.eff, updatedGame.eff, updated.eff]),
  };

  const eventsNew = batchMsgs(rest, updatedGame.event);

  return loop(ctx, eventsNew, accNew);
}

async function sendEventToServer({
  model,
  eventId,
}: {
  model: ClientModel;
  eventId: EventId;
}): Promise<{
  model: ClientModel;
  cmd?: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>[];
}> {
  const eventWithMeta = await SpaceEvents.get(model.events, eventId);

  if (!eventWithMeta) {
    return { model };
  }

  return {
    model,
    cmd: [
      sendToServer({ t: "event", c: { ...eventWithMeta }, clock: model.clock }),
    ],
  };
}

async function appendEvents({
  model,
  event,
}: {
  model: ClientModel;
  event: WithEventId<Event>;
}): Promise<{
  model: ClientModel;
}> {
  const appended = await appendEvent(model, event);
  return { model: { ...model, ...appended } };
}

const updateGameFromEvent = async ({
  model,
  eventId,
  ctx,
  before,
  after,
}: {
  before: SpaceStateStarted | null;
  after: SpaceStateStarted | null;
  model: ClientModel;
  eventId: EventId;
  ctx: ClientCtx | AnonymousClientCtx;
}): Promise<{
  model: ClientModel;
  eff?: Eff<ClientMsg>;
  cmd?: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>[];
  event?: WithEventId<Event>[];
}> => {
  const eventWithMeta = await SpaceEvents.get(model.events, eventId);

  if (!after || !after.game || !ctx.currentUserId || !eventWithMeta) {
    return { model };
  }

  const updatedGame = Game.update({
    ctx: {
      ...ctx,
      currentUserId: ctx.currentUserId,
      space: after,
      quit() {},
      viewProfile() {},
    },
    gameEvent:
      eventWithMeta.t === "game"
        ? { ...eventWithMeta, ...eventWithMeta.c }
        : null,
    model: model.games[eventWithMeta.spaceId] ?? Game.init(after.game.t),
    gameState: before?.game ?? after.game,
  });

  const eventsNew =
    updatedGame.gameEvent?.map((e) =>
      withId<Event>({
        t: "game",
        spaceId: eventWithMeta.spaceId,
        c: e,
      })
    ) ?? [];

  return {
    model: {
      ...model,
      games: {
        ...model.games,
        [eventWithMeta.spaceId]: updatedGame.model,
      },
    },
    eff: Eff.map_(
      (c) => ({ t: "game", spaceId: eventWithMeta.spaceId, c }),
      updatedGame.eff
    ),
    event: eventsNew,
    cmd: ClientCmd.map(
      updatedGame?.cmd ?? [],
      (c) => ({
        t: "game",
        c,
        spaceId: eventWithMeta.spaceId,
      }),
      (c) => ({
        t: "game",
        c,
        spaceId: eventWithMeta.spaceId,
      })
    ),
  };
};

const updateSpaceFromEvent = async ({
  ctx,
  model,
  event,
  stateBefore,
}: {
  stateBefore: State;
  ctx: ClientCtx | AnonymousClientCtx;
  model: ClientModel;
  event: Event;
}): Promise<{
  model: ClientModel;
  cmd?: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>[];
}> => {
  if (!ctx.currentUserId) {
    return { model };
  }

  const state = await deriveState(model);

  const currentUserStateBefore = toUserState(stateBefore, ctx.currentUserId);
  const currentUserState = toUserState(state, ctx.currentUserId);

  switch (event.t) {
    case "user-joined-space": {
      if (event.spaceId === currentUserState.spaceId) {
        return {
          model,
          cmd: [playSound(APP_SOUND.navForward)],
        };
      }
      return { model };
    }

    case "user-left-space": {
      if (event.spaceId === currentUserState.spaceId) {
        return {
          model,
          cmd: [playSound(APP_SOUND.navBackward)],
        };
      }
      return { model };
    }

    case "user-started-space": {
      if (event.userId === ctx.currentUserId) {
        return {
          model,
          cmd: [
            playSound(APP_SOUND.navForward),
            pushRoute({
              t: "space",
              c: { t: "space", spaceId: event.spaceId },
            }),
          ],
        };
      }
      return { model };
    }

    case "user-ended-space": {
      if (event.spaceId !== currentUserStateBefore.spaceId) {
        return { model };
      }
      return AppClientModule.chainUpdates(
        { model },
        (model) => {
          return {
            model,
            cmd: [playSound(APP_SOUND.navBackward)],
          };
        },
        (model) => {
          if (
            ctx.currentRoute.t === "space" &&
            ctx.currentRoute.c.t === "space" &&
            ctx.currentRoute.c.spaceId === event.spaceId
          ) {
            return {
              model,
              cmd: [pushRoute({ t: "space", c: { t: "space-list" } })],
            };
          }
          return {
            model,
            cmd: [],
          };
        },
        (model) => {
          if (event.userId === ctx.currentUserId) {
            return {
              model,
              cmd: [showToast("Space ended")],
            };
          }

          const profile = ctx.profiles[event.userId];

          if (!profile) {
            return {
              model,
              cmd: [showToast("Space ended by host")],
            };
          }

          return {
            model,
            cmd: [showToast(`Space ended by ${profile.username}`)],
          };
        }
      );
    }

    case "user-inputted-game": {
      if (event.spaceId === currentUserState.spaceId) {
        return {
          model,
          cmd: [
            playSound(
              event.game ? APP_SOUND.navForwardMin : APP_SOUND.navBackwardMin
            ),
          ],
        };
      }
      return { model };
    }

    case "game": {
      return { model };
    }
  }
};
