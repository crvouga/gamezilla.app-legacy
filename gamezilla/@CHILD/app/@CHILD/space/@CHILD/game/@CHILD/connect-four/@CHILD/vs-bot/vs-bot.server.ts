import { Sub, chainAwait, isErr } from "gamezilla/@SHARED/core";
import {
  GameServer,
  sendToSpace,
} from "gamezilla/@CHILD/app/@CHILD/space/@SHARED";
import {
  GameEvent,
  ServerModel,
  ServerMsg,
  GameState,
  ToClient,
  ToServer,
  isBotTurn,
  toBotPlayer,
} from "./vs-bot.core";
import * as ConnectFour from "../../@SHARED/connect-four/connect-four";
import { ConnectFourBotWorker } from "../../@SHARED/connect-four";

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

export const subscriptions: Server["subscriptions"] = async (input) => {
  return Sub.None;
};
