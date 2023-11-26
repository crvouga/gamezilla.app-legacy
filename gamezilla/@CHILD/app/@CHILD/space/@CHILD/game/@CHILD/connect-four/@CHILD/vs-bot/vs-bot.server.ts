import { GameServer } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED";
import { Sub, isErr } from "gamezilla/@SHARED/core";
import { ConnectFourBotWorker } from "../../@SHARED/connect-four";
import * as ConnectFour from "../../@SHARED/connect-four/connect-four";
import {
  GameEvent,
  GameState,
  ServerModel,
  ServerMsg,
  ToClient,
  ToServer,
  isBotTurn,
  toBotPlayer,
} from "./vs-bot.core";

//
//
//
//
//
//
//

type Server = GameServer<{
  ServerModel: ServerModel;
  ServerMsg: ServerMsg;
  ToClient: ToClient;
  ToServer: ToServer;
  GameState: GameState;
  GameEvent: GameEvent;
}>;

export const init: Server["init"] = async ({ model }) => {
  if (model) {
    return { model };
  }
  return { model: { isBotMoving: false } };
};

export const update: Server["update"] = async (input) => {
  return GameServer.chain(
    await init(input),
    //
    async (model): ReturnType<Server["update"]> => {
      if (
        model.isBotMoving ||
        !isBotTurn(input.state) ||
        input.state.type !== "game"
      ) {
        return { model };
      }

      const found = ConnectFourBotWorker.findBestMove({
        columns: input.state.columns,
        maxDepth: 4,
        maximizingPlayer: toBotPlayer(input.state),
      });

      if (isErr(found)) {
        console.log(found.error);
        return { model };
      }

      const columnIndex = found.value.columnIndex;

      if (!ConnectFour.isColumnIndex(columnIndex)) {
        return { model };
      }

      return {
        model,
        gameEvent: [{ t: "bot-dropped-disc", columnIndex }],
      };
    }
  );
};

export const subscriptions: Server["subscriptions"] = async (_input) => {
  return Sub.None;
};
