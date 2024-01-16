import { GameServerModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-server-v2";
import {
  SpaceServerCtx,
  SpaceServerEvent,
} from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space";
import {
  SpaceServerCmd,
  sendToSpace,
} from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space-server-cmd";
import { sendBack } from "gamezilla/@CHILD/app/@SHARED/server";
import { Sub } from "gamezilla/@SHARED/core";
import { FlowPuzzleDb } from "../../@SHARED/flow-puzzle-db";
import {
  GameEvent,
  GameState,
  ServerModel,
  ServerMsg,
  ToClient,
  ToServer,
} from "./puzzle-builder.core";

type Module = GameServerModule<{
  ToClient: ToClient;
  ToServer: ToServer;
  GameEvent: GameEvent;
  GameState: GameState;
  Ctx: SpaceServerCtx;
  InCmd: null;
  InEvent: SpaceServerEvent;
  Model: ServerModel;
  Msg: ServerMsg;
  OutCmd: SpaceServerCmd<ToClient>;
  OutEvent: null;
}>;

const init: Module["init"] = {
  hasListedPuzzles: false,
};

const update: Module["update"] = async (input) => {
  return GameServerModule.chainUpdates(
    { model: input.model },
    //
    (model) => updateFromClient({ ...input, model }),
    (model) => updateFromGameEvent({ ...input, model })
  );
};

const updateFromGameEvent: Module["update"] = async (input) => {
  const { gameEvent, model } = input;

  if (!gameEvent) {
    return { model };
  }

  switch (gameEvent.t) {
    case "user-created-new-puzzle": {
      const put = await FlowPuzzleDb().put(gameEvent.puzzle);
      return {
        model: input.model,
        cmd: [sendToSpace({ t: "put-puzzle", put })],
      };
    }

    default: {
      return { model };
    }
  }
};

const updateFromClient: Module["update"] = async (input) => {
  const { fromClient, model } = input;
  if (!fromClient) {
    return { model };
  }

  switch (fromClient.t) {
    case "list-puzzles": {
      const listed = await FlowPuzzleDb().list(fromClient.input);

      return {
        model: input.model,
        cmd: [sendBack(fromClient, { t: "listed-puzzle", listed })],
      };
    }
  }
};

const subscriptions: Module["subscriptions"] = async () => {
  return Sub.None;
};

export const PuzzleBuilderServer: Module = {
  init,
  update,
  subscriptions,
};
