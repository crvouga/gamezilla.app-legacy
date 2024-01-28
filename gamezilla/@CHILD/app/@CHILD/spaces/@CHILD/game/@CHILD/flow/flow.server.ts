import { GameServerModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-server-v2";
import {
  SpaceServerCtx,
  SpaceServerEvent,
} from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space";
import { Sub } from "gamezilla/@SHARED/core";
import { SpaceServerCmd } from "../../../../@SHARED/space-server-cmd";
import { BuilderServer } from "./@CHILD/builder/builder.server";
import { PlayServer } from "./@CHILD/play/play.server";
import {
  GameEvent,
  GameState,
  ServerModel,
  ServerMsg,
  ToClient,
  ToServer,
} from "./flow.core";

type Module = GameServerModule<{
  Model: ServerModel;
  Msg: ServerMsg;
  ToClient: ToClient;
  ToServer: ToServer;
  GameEvent: GameEvent;
  GameState: GameState;
  Ctx: SpaceServerCtx;
  InCmd: null;
  InEvent: SpaceServerEvent;
  OutCmd: SpaceServerCmd<ToClient>;
  OutEvent: null;
  Deps: null;
}>;

const init: Module["init"] = {
  t: "none",
};

const update: Module["update"] = async (input) => {
  return GameServerModule.chainUpdates({ model: input.model }, (model) =>
    updateChild({ ...input, model })
  );
};

const updateChild: Module["update"] = async (input) => {
  const { gameState } = input;

  switch (gameState.t) {
    case "play": {
      const updated = await PlayServer.update({
        ctx: input.ctx,
        gameState: gameState.c,
        model: input.model.t === "play" ? input.model.c : PlayServer.init,
        cmd: input.cmd,
        event: input.event,
        fromClient:
          input.fromClient?.t === "play"
            ? { ...input.fromClient, ...input.fromClient.c }
            : null,
        gameEvent:
          input.gameEvent?.t === "play"
            ? { ...input.gameEvent, ...input.gameEvent.c }
            : null,
        msg: input.msg?.t === "play" ? input.msg.c : null,
        deps: null,
      });

      const tagged = GameServerModule.tagOutput(
        "play",
        (cmd) => SpaceServerCmd.tag("play", cmd),
        updated
      );

      return tagged;
    }

    case "builder": {
      const updated = await BuilderServer.update({
        ctx: input.ctx,
        gameState: gameState.c,
        model: input.model.t === "builder" ? input.model.c : BuilderServer.init,
        cmd: input.cmd,
        event: input.event,
        fromClient:
          input.fromClient?.t === "builder"
            ? { ...input.fromClient, ...input.fromClient.c }
            : null,
        gameEvent:
          input.gameEvent?.t === "builder"
            ? { ...input.gameEvent, ...input.gameEvent.c }
            : null,
        msg: input.msg?.t === "builder" ? input.msg.c : null,
        deps: await BuilderServer.deps(),
      });

      const tagged = GameServerModule.tagOutput(
        "builder",
        (cmd) => SpaceServerCmd.tag("builder", cmd),
        updated
      );

      return tagged;
    }

    case null: {
      return { model: input.model };
    }
  }
};

const subscriptions: Module["subscriptions"] = async (input) => {
  const { gameState } = input;

  switch (gameState.t) {
    case "play": {
      return Sub.tag(
        "play",
        await PlayServer.subscriptions({
          ctx: input.ctx,
          gameState: gameState.c,
          model: input.model.t === "play" ? input.model.c : PlayServer.init,
        })
      );
    }

    case "builder": {
      return Sub.tag(
        "builder",
        await BuilderServer.subscriptions({
          ctx: input.ctx,
          gameState: gameState.c,
          model:
            input.model.t === "builder" ? input.model.c : BuilderServer.init,
        })
      );
    }

    case null: {
      return Sub.None;
    }
  }
};

export const FlowServer: Module = {
  init,
  subscriptions,
  update,
  async deps() {
    return null;
  },
};
