import * as Route from "Route";
import * as Snackbar from "Snackbar";
import * as UI from "UI";
import { keyframes } from "@mui/system";
import { Cmd, Sub, pipe } from "Core";
import { andThen, exhaustive } from "Utility";
import * as Chess from "./Chess";
import * as ConnectFour from "./ConnectFour";
import * as Snake from "./Snake";
import * as TicTacToe from "./TicTacToe";

//
//
//
// Model
//
//
//

export type Model = Closed | Opened;

type Closed = {
  type: "Closed";
};

type Opened = {
  type: "Opened";
  status: "Idle" | "ConfirmingClose";
  child:
    | { type: "TicTacToe"; child: TicTacToe.Model }
    | { type: "ConnectFour"; child: ConnectFour.Model }
    | { type: "Chess"; child: Chess.Model }
    | { type: "Snake"; child: Snake.Model };
};

export type Game = Opened["child"]["type"];

//
//
//
// Init
//
//
//

export const init: Model = { type: "Closed" };

const initOpened = ({ game }: { game: Game }): [Opened, Cmd.Cmd<Msg>] => {
  return [
    { type: "Opened", status: "Idle", child: initGame({ game }) },
    Route.push({ type: "Game" }),
  ];
};

const initGame = ({ game }: { game: Game }): Opened["child"] => {
  switch (game) {
    case "Chess":
      return { type: "Chess", child: Chess.init };

    case "ConnectFour":
      return { type: "ConnectFour", child: ConnectFour.init };

    case "TicTacToe":
      return { type: "TicTacToe", child: TicTacToe.init };

    case "Snake":
      return { type: "Snake", child: Snake.init };
  }
};

//
//
//
// Msg
//
//
//

export type Msg =
  | { group: "Game"; type: "ConfirmedClose" }
  | { group: "Game"; type: "CancelledClose" }
  | { group: "Game"; type: "ClickedClose" }
  | { group: "Game"; type: "ClickedBanner" }
  | GameMsg;

type GameMsg = Chess.Msg | ConnectFour.Msg | TicTacToe.Msg | Snake.Msg;

type OutAction = Snackbar.Action;

export type Action = Open | Close;

export const Open = (game: Game) =>
  ({ group: "Game", type: "Open", game } as const);
export type Open = ReturnType<typeof Open>;

export const Close = (game: Game) =>
  ({ group: "Game", type: "Close", game } as const);
export type Close = ReturnType<typeof Close>;

//
//
//
// Update
//
//
//

export const runAction = (
  action: Action,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (action.type) {
    case "Open":
      if (model.type === "Closed") {
        return initOpened(action);
      }

      if (action.game === model.child.type) {
        return [model, Route.push({ type: "Game" })];
      }

      return [model, Cmd.None];

    case "Close":
      return [model, Cmd.None];
  }
};

export const update = (
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  switch (model.type) {
    case "Closed":
      return updateClosed(msg, model);

    case "Opened":
      return updateOpened(msg, model);
  }
};

const updateOpened = (
  msg: Msg,
  model: Opened,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  switch (msg.group) {
    case "Game": {
      switch (msg.type) {
        case "ClickedClose":
          return [{ ...model, status: "ConfirmingClose" }, Cmd.None, []];

        case "ClickedBanner":
          return [model, Route.push({ type: "Game" }), []];

        case "CancelledClose":
          return [{ ...model, status: "Idle" }, Cmd.None, []];

        case "ConfirmedClose":
          return [{ type: "Closed" }, Cmd.None, []];
      }
    }
    case "Chess":
    case "ConnectFour":
    case "Snake":
    case "TicTacToe":
      const [child, childCmd] = updateGame(msg, model.child);
      return [{ ...model, child }, childCmd, []];
  }
};

const updateGame = (
  msg: GameMsg,
  model: Opened["child"],
): [Opened["child"], Cmd.Cmd<GameMsg>] => {
  switch (model.type) {
    case "Chess":
      if (msg.group === "Chess") {
        const [modelChild, cmdChild] = Chess.update(msg, model.child);
        return [{ type: "Chess", child: modelChild }, cmdChild];
      }
      return [model, Cmd.None];

    case "ConnectFour":
      if (msg.group === "ConnectFour") {
        const [modelChild, cmdChild] = ConnectFour.update(msg, model.child);

        return [{ type: "ConnectFour", child: modelChild }, cmdChild];
      }
      return [model, Cmd.None];

    case "TicTacToe":
      if (msg.group === "TicTacToe") {
        const [modelChild, cmdChild] = TicTacToe.update(msg, model.child);

        return [{ type: "TicTacToe", child: modelChild }, cmdChild];
      }

      return [model, Cmd.None];

    case "Snake":
      if (msg.group === "Snake") {
        const [modelChild, cmdChild] = Snake.update(msg, model.child);

        return [{ type: "Snake", child: modelChild }, cmdChild];
      }

      return [model, Cmd.None];

    default:
      return exhaustive(model);
  }
};

const updateClosed = (
  msg: Msg,
  model: Closed,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  return [model, Cmd.None, []];
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (model: Model): Sub.Sub<Msg> => {
  switch (model.type) {
    case "Closed":
      return Sub.None;

    case "Opened":
      switch (model.child.type) {
        case "Chess":
          return Sub.None;

        case "ConnectFour":
          return Sub.None;

        case "Snake":
          return Snake.subscriptions(model.child.child);

        case "TicTacToe":
          return Sub.None;
      }
  }
};

//
//
//
// View
//
//
//

export const view = (model: Model): UI.View<Msg> => {
  switch (model.type) {
    case "Closed":
      return viewClosed;

    case "Opened":
      return viewOpened(model);
  }
};

const viewOpened = (model: Opened): UI.View<Msg> => {
  switch (model.child.type) {
    case "Chess":
      return Chess.view(model.child.child);

    case "ConnectFour":
      return ConnectFour.view(model.child.child);

    case "TicTacToe":
      return TicTacToe.view(model.child.child);

    case "Snake":
      return Snake.view(model.child.child);
  }
};

const viewClosed: UI.View<Msg> = () => {
  return <>game is closed</>;
};

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

export const viewBanner =
  (model: Opened): UI.View<Msg> =>
  (dispatch) =>
    (
      <>
        <UI.Paper
          variant="outlined"
          sx={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            margin: 0,
            padding: 0,
          }}
        >
          <UI.ButtonBase
            sx={{ flex: 1, margin: 0, padding: 0 }}
            onClick={() => dispatch({ group: "Game", type: "ClickedBanner" })}
          >
            <UI.Box sx={{ width: 64, marginRight: 2 }}>
              <GameIcon game={model.child.type} />
            </UI.Box>
            <UI.Typography align="left" variant="h5" sx={{ flex: 1 }}>
              {gameToName(model.child.type)}
            </UI.Typography>
          </UI.ButtonBase>

          <UI.ButtonBase
            sx={{ width: "15%", height: "100%", p: 2, margin: 0 }}
            onClick={() =>
              dispatch({
                group: "Game",
                type: "ClickedClose",
              })
            }
          >
            <UI.Icons.Close />
          </UI.ButtonBase>
        </UI.Paper>

        {UI.conformationDialog<Msg>({
          open: model.status === "ConfirmingClose",
          title: `Close ${gameToName(model.child.type)}?`,
          confirmTitle: `Close ${gameToName(model.child.type)}`,
          onClose: { group: "Game", type: "CancelledClose" },
          onCancel: { group: "Game", type: "CancelledClose" },
          onConfirm: { group: "Game", type: "ConfirmedClose" },
        })(dispatch)}
      </>
    );

export const gameToName = (game: Game): string => {
  switch (game) {
    case "Chess":
      return "Chess";

    case "ConnectFour":
      return "Connect Four";

    case "TicTacToe":
      return "Tic Tac Toe";

    case "Snake":
      return "Snake";
  }
};

const GameIcon = ({ game }: { game: Game }) => {
  switch (game) {
    case "Chess":
      return <Chess.Icon />;

    case "ConnectFour":
      return <ConnectFour.Icon id="gameicon" />;

    case "TicTacToe":
      return <TicTacToe.Icon />;

    case "Snake":
      return <Snake.Icon />;
  }
};
