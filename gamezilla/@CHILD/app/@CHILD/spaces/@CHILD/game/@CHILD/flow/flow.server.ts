import { GameServerModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-server-v2";
import {
  SpaceServerCtx,
  SpaceServerEvent,
} from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space";
import { Sub } from "gamezilla/@SHARED/core";
import { SpaceServerCmd } from "../../../../@SHARED/space-server-cmd";
import { PlayServer } from "./@CHILD/play/play.server";
import {
  GameEvent,
  GameState,
  ServerModel,
  ServerMsg,
  ToClient,
  ToServer,
} from "./flow.core";
import { PuzzleBuilderServer } from "./@CHILD/puzzle-builder/puzzle-builder.server";

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

    case "puzzle-builder": {
      const updated = await PuzzleBuilderServer.update({
        ctx: input.ctx,
        gameState: gameState.c,
        model:
          input.model.t === "puzzle-builder"
            ? input.model.c
            : PuzzleBuilderServer.init,
        cmd: input.cmd,
        event: input.event,
        fromClient:
          input.fromClient?.t === "puzzle-builder"
            ? { ...input.fromClient, ...input.fromClient.c }
            : null,
        gameEvent:
          input.gameEvent?.t === "puzzle-builder"
            ? { ...input.gameEvent, ...input.gameEvent.c }
            : null,
        msg: input.msg?.t === "puzzle-builder" ? input.msg.c : null,
        deps: await PuzzleBuilderServer.deps(),
      });

      const tagged = GameServerModule.tagOutput(
        "puzzle-builder",
        (cmd) => SpaceServerCmd.tag("puzzle-builder", cmd),
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

    case "puzzle-builder": {
      return Sub.tag(
        "puzzle-builder",
        await PuzzleBuilderServer.subscriptions({
          ctx: input.ctx,
          gameState: gameState.c,
          model:
            input.model.t === "puzzle-builder"
              ? input.model.c
              : PuzzleBuilderServer.init,
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
