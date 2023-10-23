import { Eff, Sub } from "gamezilla/@SHARED/core";
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
      const before = toState(
        model.spaceByUserId,
        model.spaceEvents[msg.spaceId] ?? {
          events: [],
          initialState: {
            type: "initial",
          },
        }
      );

      const appended = appendEvent(model, msg);

      const after = toState(
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
        before,
        after,
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
        cmd: [
          msg.t === "game" && after.type === "started"
            ? sendToUser(Object.values(after.space.users), msg)
            : broadcast(msg),
        ],
      };
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
  before,
  after,
}: {
  before: State;
  after: State;
  model: ServerModel;
  msg: Evt;
  ctx: ServerCtx;
}): Promise<{
  model: ServerModel;
  eff?: Eff<ServerMsg>;
  cmd?: ServerCmd<ToClient>[];
}> => {
  switch (msg.t) {
    case "user-inputted-game": {
      const spaceModel = model.spaceEvents[msg.spaceId];

      if (!spaceModel) {
        return { model };
      }

      const state = toState(model.spaceByUserId, spaceModel);

      if (state.type === "initial") {
        return { model };
      }

      if (state.type === "ended") {
        return { model };
      }

      if (!state.game) {
        return { model };
      }

      const initial = await GameServer.init({
        ctx: { ...ctx, space: state.space },
        state: state.game,
      });

      return {
        model: {
          ...model,
          games: {
            ...model.games,
            [msg.spaceId]: initial.model,
          },
        },
        eff: Eff.map_(
          (c) => ({
            t: "game-msg",
            spaceId: msg.spaceId,
            c,
          }),
          initial.eff
        ),
        cmd: spaceCmdToCmd(
          state.space,
          SpaceServerCmd.map(initial.cmd ?? [], (c) => ({
            t: "game-msg",
            spaceId: msg.spaceId,
            c,
          }))
        ),
      };
    }

    case "game": {
      if (
        before.type === "initial" ||
        before.type === "ended" ||
        !before.game ||
        after.type === "initial" ||
        after.type === "ended" ||
        !after.game
      ) {
        return { model };
      }

      const game = model.games[msg.spaceId];

      if (!game) {
        return { model };
      }

      const updated = await GameServer.updateFromGame({
        ctx: { ...ctx, space: after.space },
        msg: msg.c,
        model: game,
        before: before.game,
        after: after.game,
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
          after.space,
          SpaceServerCmd.map(updated.cmd ?? [], (c) => ({
            t: "game-msg",
            spaceId: msg.spaceId,
            c,
          }))
        ),
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
