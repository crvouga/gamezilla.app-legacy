import { Eff } from "gamezilla/@SHARED/core";
import { SpaceClientCtx, SpaceViewCtx } from "gamezilla/app/space/@SHARED";
import { VsUserSetupScreen } from "gamezilla/app/space/game/@SHARED";
import { Position, Slot, toTurn } from "../tic-tic-toe/tic-tac-toe";
import {
  PlayerTypeIcon,
  ViewCoverArt,
  ViewSlot,
  gameTheme,
} from "../tic-tic-toe/tic-tac-toe-ui";
import * as Round from "./vs-user-round";
import {
  ClientModel,
  ClientMsg,
  Res,
  ServerModel,
  ToClient,
  ToServer,
  initCoreModel,
} from "./vs-user.core";
import { ClientCmd } from "gamezilla/app/@SHARED/client";

//
//
//
// Model
//
//
//

export const init: ClientModel = {
  ...initCoreModel({ X: "none", O: "none" }),
  openedModal: "none",
};

//
//
// Update
//
//
//

export const update = (
  msg: ClientMsg,
  model: ClientModel
): {
  model: ClientModel;
  cmd?: ClientCmd<ToServer>[];
} => {
  switch (msg[0]) {
    //
    //
    // Client Msg
    //
    //

    case "close-modal": {
      return { model: { ...model, openedModal: "none" } };
    }

    case "OpenModal": {
      return { model: { ...model, openedModal: msg[1] } };
    }

    //
    //
    //
    // Request Msg
    //
    //
    //

    case "RematchAccept":
    case "RematchAsk":
    case "RematchDecline":
    case "Rematch_Cancel":
    case "InputBestOutOf":
    case "input-move":
    case "resign":
    case "InputPlayer":
    case "stop-playing":
    case "start-game":
    case "NewGame": {
      return { model, cmd: [{ t: "send-to-server", msg }] };
    }

    default: {
      return { model };
    }
  }
};

export const updateFromServer = (
  _: { ctx: SpaceClientCtx },
  msg: ToClient,
  model: ClientModel
): [ClientModel] => {
  switch (msg[0]) {
    case "player-left": {
      const modelNew = syncWithServer(model, msg[1]);
      return [modelNew];
    }

    case "RematchAccept_Done":
    case "RematchAsk_Done":
    case "Rematch_Cancel_Done":
    case "NewGame_Done":
    case "InputBestOutOf_Done":
    case "input-move-done":
    case "InputPlayer_Done":
    case "StopPlaying_Done":
    case "StartGame_Done":
    case "RematchDecline_Done":
    case "resign_Done": {
      const res: Res = msg;

      if (res[1].t === "err") {
        return [model];
      }

      const modelNew = syncWithServer(model, res[1].value);

      return [{ ...modelNew, openedModal: "none" }];
    }

    case "MoveCountDown_Done":
    case "RoundCountDown_Done": {
      if (msg[1].t === "err") {
        return [model];
      }

      const modelNew = syncWithServer(model, msg[1].value);

      return [modelNew];
    }

    default: {
      return [model];
    }
  }
};

export const syncWithServer = (
  clientModel: ClientModel,
  serverModel: ServerModel
): ClientModel => {
  return {
    ...serverModel,
    openedModal: clientModel.openedModal,
  };
};

//
//
//
// View
//
//
//

export const View = ({
  ctx,
  model,
  dispatch,
  onCloseGame,
}: {
  ctx: SpaceViewCtx;
  model: ClientModel;
  dispatch: (msg: ClientMsg) => void;
  onCloseGame: () => void;
}) => {
  if (model.type === "setup") {
    return (
      <VsUserSetupScreen
        ctx={ctx}
        onQuit={onCloseGame}
        onStartGame={() =>
          dispatch(["start-game", { userId: ctx.currentUserId }])
        }
        renderCoverArt={(props) => {
          return (
            <div {...props}>
              <ViewCoverArt />
            </div>
          );
        }}
        title={"Tic-Tac-Toe"}
        canStartGame={model.X !== "none" && model.O !== "none"}
        playerOne={{
          label: "Cross",
          userId: model.X === "none" ? null : model.X,
          renderIcon: (props) => {
            return <PlayerTypeIcon playerType="X" {...props} />;
          },
          onStartPlaying: () => {
            dispatch([
              "InputPlayer",
              { playerType: "X", userId: ctx.currentUserId },
            ]);
          },
          onStopPlaying: () => {
            dispatch([
              "InputPlayer",
              { playerType: "X", userId: ctx.currentUserId },
            ]);
          },
        }}
        playerTwo={{
          label: "Naught",
          userId: model.O === "none" ? null : model.O,
          renderIcon: (props) => {
            return <PlayerTypeIcon playerType="O" {...props} />;
          },
          onStartPlaying: () => {
            dispatch([
              "InputPlayer",
              { playerType: "O", userId: ctx.currentUserId },
            ]);
          },
          onStopPlaying: () => {
            dispatch([
              "InputPlayer",
              { playerType: "O", userId: ctx.currentUserId },
            ]);
          },
        }}
      />
    );
  }

  if (model.type === "game") {
    return <div></div>;
  }

  return <div></div>;
};

export const toGameText = ({ model }: { model: ClientModel }): string => {
  switch (model.type) {
    case "setup": {
      return "Setting up";
    }

    case "game-over": {
      switch (model.gameOver.type) {
        case "resignation": {
          return `Resigned`;
        }

        case "Winner": {
          // const userId = model[model.gameOver.winner];

          return `won`;
        }

        case "Tie": {
          return `Tie`;
        }

        default: {
          return "Game Over";
        }
      }
    }

    case "game": {
      const currentRound = Round.toCurrent(model.round);

      switch (currentRound.type) {
        case "RoundOver": {
          switch (currentRound.roundOver.type) {
            case "Tie": {
              return "Tie";
            }

            case "Win": {
              return `${currentRound.roundOver.winner} won`;
            }

            default: {
              return "Round Over";
            }
          }
        }
        case "RoundStarted": {
          const turn = toTurn(currentRound.board);
          return `${turn} Turn`;
        }

        case "RoundStarting": {
          return "Starting...";
        }

        default: {
          return "Starting...";
        }
      }
    }
  }
};

//
//
//
//
//
//
//

export const CoverArt = () => {
  const positions: [Position, Slot][] = [
    [{ row: 0, column: 0 }, "X"],
    [{ row: 0, column: 1 }, "_"],
    [{ row: 1, column: 0 }, "_"],
    [{ row: 1, column: 1 }, "O"],
  ];

  const LINES = [
    { x1: 1, y1: 0, x2: 1, y2: 3 },
    { x1: 0, y1: 1, x2: 3, y2: 1 },
  ] as const;

  return (
    <svg width="100%" viewBox="0 0 2 2">
      <rect x={0} y={0} width={2} height={2} fill={gameTheme.background} />

      {LINES.map((line, index) => (
        <line
          key={index}
          {...line}
          stroke={gameTheme.line}
          stroke-width={0.1}
        />
      ))}

      {positions.map(([{ column, row }, slot], index) => (
        <ViewSlot
          key={index}
          slot={slot}
          cx={Number(column) + 0.5}
          cy={Number(row) + 0.5}
          r={0.3}
        />
      ))}
    </svg>
  );
};
