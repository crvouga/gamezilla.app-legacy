import {
  APP_SOUND,
  AnonymousClientCtx,
  ClientCmd,
  ClientCtx,
  playSound,
  pushRoute,
  sendToServer,
} from "gamezilla/@CHILD/app/@SHARED/client";
import { SpaceId } from "gamezilla/@CHILD/app/@SHARED/data";
import { Eff, chain } from "gamezilla/@SHARED/core";
import * as GameClient from "../@CHILD/game/game.client";
import {
  ClientModel,
  ClientMsg,
  Event,
  EventWithMeta,
  ToServer,
  appendEvent,
  toStateSpace,
  toStateUser,
} from "../space.core";

/**
 * Handles updating the client model from updated game model
 */
export const mergeUpdatedGame = ({
  model,
  spaceId,
  updated,
}: {
  spaceId: SpaceId;
  model: ClientModel;
  updated: ReturnType<typeof GameClient.update>;
}): {
  model: ClientModel;
  cmd: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>[];
  eff: Eff<ClientMsg>;
} => {
  return {
    model: {
      ...model,
      games: {
        ...model.games,
        [spaceId]: updated.model,
      },
    },
    cmd: ClientCmd.map(
      updated.cmd ?? [],
      (c) => ({ t: "game-msg", c, spaceId }),
      (c) => ({ t: "game-msg", c, spaceId })
    ),
    eff: Eff.map_((c) => ({ t: "game-msg", c, spaceId }), updated.eff),
  };
};

/**
 * Handles merging new events into the client model
 */
export const mergeNewEvents = (input: {
  ctx: ClientCtx | AnonymousClientCtx;
  model: ClientModel;
  events: EventWithMeta[];
}): {
  model: ClientModel;
  eff?: Eff<ClientMsg>;
  cmd?: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>[];
} => {
  const { ctx } = input;

  const eventsNew = input.events.filter(
    (event) => !(event.eventId in input.model.events.events)
  );

  if (eventsNew.length === 0) {
    return input;
  }

  return chain(
    input,

    // Add events to model
    (model) => {
      const appended = appendEvent(model, eventsNew);
      return {
        model: {
          ...model,
          ...appended,
        },
      };
    },

    // Send events to server
    (model) => {
      return {
        model,
        cmd: eventsNew.map((event) =>
          sendToServer({
            ...event,
            profile: ctx.currentUserId ? ctx.profiles[ctx.currentUserId] : null,
          })
        ),
      };
    },

    // Update sounds
    (model) => {
      let acc: ReturnType<typeof mergeNewEvents> = { model };

      for (const event of eventsNew) {
        const updated = updateSoundFromEvent({
          ctx,
          event: event,
          model: acc.model,
        });

        acc = {
          model: updated.model,
          cmd: [...(acc.cmd ?? []), ...(updated.cmd ?? [])],
        };
      }

      return acc;
    },

    // Update games
    (model) => {
      let acc: ReturnType<typeof mergeNewEvents> = { model };

      for (const event of eventsNew) {
        const updated = updateGameFromEvent({
          ctx,
          event,
          model: acc.model,
        });

        acc = {
          model: updated.model,
          cmd: [...(acc.cmd ?? []), ...(updated.cmd ?? [])],
          eff: Eff.batch([acc.eff, updated.eff]),
        };
      }

      return acc;
    },

    // Redirect to space if current user started space
    (model) => {
      const found = eventsNew.find(
        (event) =>
          event.t === "user-started-space" &&
          ctx.currentUserId &&
          toStateUser(model, ctx.currentUserId).spaceId === event.spaceId
      );

      if (found) {
        return {
          model,
          cmd: [
            pushRoute({
              t: "space",
              c: { t: "space", spaceId: found.spaceId },
            }),
          ],
        };
      }

      return { model };
    }
  );
};

const updateGameFromEvent = ({
  model,
  event,
  ctx,
}: {
  model: ClientModel;
  event: EventWithMeta;
  ctx: ClientCtx | AnonymousClientCtx;
}): {
  model: ClientModel;
  eff?: Eff<ClientMsg>;
  cmd?: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>[];
} => {
  const space = toStateSpace(model, event.spaceId);

  if (
    space.type === "initial" ||
    space.type === "ended" ||
    !space.game ||
    !ctx.currentUserId
  ) {
    return { model };
  }

  const updated = GameClient.update({
    ctx: {
      ...ctx,
      currentUserId: ctx.currentUserId,
      space: space,
    },
    gameEvent: event.t === "game" ? event.c : null,
    model: model.games[event.spaceId],
    state: space.game,
  });

  return {
    model: {
      ...model,
      games: {
        ...model.games,
        [event.spaceId]: updated.model,
      },
    },
    eff: Eff.map_(
      (c) => ({ t: "game-msg", spaceId: event.spaceId, c }),
      updated.eff
    ),
    cmd: updated.cmd
      ? ClientCmd.map(
          updated.cmd,
          (c) => ({
            t: "game-msg",
            c,
            spaceId: space.spaceId,
          }),
          (c) => ({
            t: "game-msg",
            c,
            spaceId: space.spaceId,
          })
        )
      : undefined,
  };
};

const updateSoundFromEvent = ({
  ctx,
  model,
  event,
}: {
  ctx: ClientCtx | AnonymousClientCtx;
  model: ClientModel;
  event: Event;
}): {
  model: ClientModel;
  cmd?: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>[];
} => {
  const currentUserState = ctx.currentUserId
    ? toStateUser(model, ctx.currentUserId)
    : null;

  if (currentUserState?.spaceId !== event.spaceId) {
    return { model };
  }

  if (event.t === "user-joined-space" && event.userId === ctx.currentUserId) {
    return {
      model,
      cmd: [playSound(APP_SOUND.navForward)],
    };
  }

  if (event.t === "user-left-space" && event.userId === ctx.currentUserId) {
    return {
      model,
      cmd: [playSound(APP_SOUND.navBackward)],
    };
  }

  if (event.t === "user-started-space" && event.userId === ctx.currentUserId) {
    return {
      model,
      cmd: [playSound(APP_SOUND.navForward)],
    };
  }

  if (event.t === "user-ended-space" && event.userId === ctx.currentUserId) {
    return {
      model,
      cmd: [playSound(APP_SOUND.navBackward)],
    };
  }

  if (event.t === "user-inputted-game") {
    return {
      model,
      cmd: [
        playSound(
          event.game ? APP_SOUND.navForwardMin : APP_SOUND.navBackwardMin
        ),
      ],
    };
  }

  return {
    model,
  };
};
