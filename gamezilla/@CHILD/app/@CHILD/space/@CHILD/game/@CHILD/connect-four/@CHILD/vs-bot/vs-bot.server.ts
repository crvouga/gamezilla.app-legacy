import { GameServer } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED";
import { Posix, Sub, Time, TimeSpan, isErr } from "gamezilla/@SHARED/core";
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
  return GameServer.chain(
    await init(input),
    (model) => watchForBotMove(model)(input),
    (model) => updateFromMsg(model)(input),
  );
};

const updateFromMsg =
  (model: ServerModel): Server["update"] =>
  async (input) => {
    const { msg } = input;

    if (!msg) {
      return { model };
    }

    switch (msg.t) {
      case "time-passed": {
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

            return {
              model,
              gameEvent: [{ t: "bot-dropped-disc", columnIndex }],
            };
          },
          async (model) => {
            return { model: { ...model, botStartedFindingMoveAt: null } };
          }
        );
      }
    }
  };

const watchForBotMove =
  (model: ServerModel): Server["update"] =>
  async ({ state, ctx,...input }) => {

    if (state.type === "game" && shouldBotMove({ state, ctx, model })) {
      console.log({
        model: model,
         clientMsg: input.clientMsg?.t,
         evt: input.evt?.t,
         gameEvent: input.gameEvent?.t,
         msg: input.msg?.t,
      });
      return {
        model: {
          ...model,
          botStartedFindingMoveAt: ctx.now,
        },
        eff: async (dispatch) => {
          await new Promise((r) => setTimeout(r, 1000/2));
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
  };

function shouldBotMove(input: {
  state: GameState;
  ctx: { now: Posix };
  model: ServerModel;
}) {
  return (
    isBotTurn(input.state) &&
    !isBotMoving(input.ctx.now, input.model)
  );
}

export const subscriptions: Server["subscriptions"] = async (input) => {
  const { model } = input;
  if (model && shouldBotMove({ ...input, model })) {
    const intervalId = `${input.intervalId}/vs-bot`;

    return Time.interval(intervalId, TimeSpan.fromSeconds(1), () => ({
      t: "time-passed",
    }));
  }
  return Sub.None;
};
