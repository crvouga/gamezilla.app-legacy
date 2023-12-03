import { GameServer } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED";
import { Time, TimeSpan, isErr } from "gamezilla/@SHARED/core";
import { withMeta$ } from "gamezilla/@SHARED/event-stream";
import { ConnectFourBotWorker } from "../../@SHARED/connect-four";
import * as ConnectFour from "../../@SHARED/connect-four/connect-four";
import {
  GameEvent,
  GameState,
  ServerModel,
  ServerMsg,
  ToClient,
  ToServer,
  isBotMoving,
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
  return { model: { botStartedFindingMoveAt: null } };
};

export const update: Server["update"] = async (input) => {
  return GameServer.chain(await init(input), (model) =>
    updateFromMsg(model)(input)
  );
};

const updateFromMsg =
  (model: ServerModel): Server["update"] =>
  async (input) => {
    const { msg, state, ctx } = input;

    if (!msg) {
      return { model };
    }

    switch (msg.t) {
      case "time-passed": {
        const shouldBotMove = isBotTurn(state) && !isBotMoving(ctx.now, model)
        if (
          state.type === "game" &&
          shouldBotMove &&
          msg.t === "time-passed"
        ) {
          return {
            model: {
              ...model,
              botStartedFindingMoveAt: ctx.now,
            },
            eff: async (dispatch) => {
              await new Promise((r) => setTimeout(r, 1000 / 4));
              const found = ConnectFourBotWorker.findBestMove({
                columns: state.columns,
                maxDepth: 4,
                maximizingPlayer: toBotPlayer(state),
              });
              dispatch({ t: "bot-found-best-move", found, startedAt: ctx.now });
            },
          };
        }

        return { model };
      }

      case "bot-found-best-move": {
        const { found } = msg;

        return GameServer.chain(
          await init(input),
          async (model) => {
            if (isErr(found)) {
              return { model };
            }

            const columnIndex = found.value.columnIndex;

            if (!ConnectFour.isColumnIndex(columnIndex)) {
              return { model };
            }

            const eventNew = withMeta$<GameEvent>({
              t: "bot-dropped-disc",
              columnIndex,
            });

            return {
              model,
              gameEvent: [eventNew],
            };
          },
          async (model) => {
            return { model: { ...model, botStartedFindingMoveAt: null } };
          }
        );
      }
    }
  };



export const subscriptions: Server["subscriptions"] = async (input) => {
  return Time.interval(
    `${input.intervalId}/vs-bot`,
    TimeSpan.fromSeconds(1 / 2),
    () => ({
      t: "time-passed",
    })
  );
};
