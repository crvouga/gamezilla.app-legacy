import { GameServerModule } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED/architecture/game-server-v2";
import {
  SpaceServerCtx,
  SpaceServerEvent,
} from "gamezilla/@CHILD/app/@CHILD/space/@SHARED/space";
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
}>;

export const init: Module["init"] = {
  t: "none",
};

export const update: Module["update"] = async (input) => {
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
      });

      const tagged = GameServerModule.tagOutput(
        "play",
        (cmd) => SpaceServerCmd.tag("play", cmd),
        updated
      );

      return tagged;
    }

    case "puzzle-builder": {
      return { model: input.model };
    }

    case null: {
      return { model: input.model };
    }
  }
};

export const subscriptions: Module["subscriptions"] = async () => {
  return Sub.None;
};
