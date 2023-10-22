import { Eff, Sub, chain, chainAwait, p } from "gamezilla/@SHARED/core";
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
  SpaceGameServer,
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

type Server = SpaceGameServer<
  ServerModel,
  ServerMsg,
  ToClient,
  ToServer,
  State,
  Evt
>;

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
      spaces: {},
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

      const space = model.spaces[spaceId];

      if (!space) {
        return { model };
      }

      const game = model.games[spaceId];

      if (!game) {
        return { model };
      }

      const state = toState(space);

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
      const space = model.spaces[msg.spaceId];

      if (!space) {
        return { model };
      }

      const game = model.games[msg.spaceId];

      if (!game) {
        return { model };
      }

      const state = toState(space);

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

    case "list": {
      return { model };
    }

    default: {
      return chainAwait(
        model,
        async (model) => {
          const space = model.spaces[msg.spaceId];

          const state = toState(
            space ?? {
              events: [],
              initialState: {
                type: "initial",
              },
            }
          );

          const appended = appendEvent(model, msg);

          return {
            model: {
              ...model,
              ...appended,
            },
            cmd: [
              msg.t === "game" && state.type === "started"
                ? sendToUser(Object.values(state.space.users), msg)
                : broadcast(msg),
            ],
          };
        },
        async (model) => {
          const updated = await updateGameModel({
            model,
            msg,
            ctx,
          });
          return {
            model: updated.model,
            // cmd: updated.cmd,
            eff: updated.eff,
          };
        }
      );
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

export const updateFromEvt = async (input: {
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
        return listSpaces(input);
      }

      return input;
    }

    case "client-connected": {
      if (msg.userId) {
        return listSpaces(input);
      }
      return input;
    }

    default: {
      return input;
    }
  }
};

const listSpaces: typeof updateFromEvt = async (input) => {
  return {
    ...input,
    cmd: [
      sendToClient([input.msg.clientId], {
        t: "list",
        spaces: input.model.spaces,
      }),
    ],
  };
};

const updateGameModel = async ({
  model,
  msg,
  ctx,
}: {
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
      const spaceModel = model.spaces[msg.spaceId];

      if (!spaceModel) {
        return { model };
      }

      const state = toState(spaceModel);

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
      const spaceModel = model.spaces[msg.spaceId];

      if (!spaceModel) {
        return { model };
      }

      const state = toState(spaceModel);

      if (state.type === "initial") {
        return { model };
      }

      if (state.type === "ended") {
        return { model };
      }

      if (!state.game) {
        return { model };
      }

      const updated = await GameServer.updateFromGameEvt({
        ctx: { ...ctx, space: state.space },
        msg: msg.c,
        model: model.games[msg.spaceId],
        state: state.game,
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

    const space = model.spaces[spaceId];

    if (!space) {
      continue;
    }

    const state = toState(space);

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
