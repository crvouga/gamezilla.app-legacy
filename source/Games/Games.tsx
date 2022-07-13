import * as Route from "Route";
import * as Snackbar from "Snackbar";
import * as UI from "UI";
import { keyframes } from "@mui/system";
import { Cmd, Sub, pipe } from "Core";
import { exhaustive } from "Utility";
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
// init
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
// Update
//
//
//

export type Msg =
  | { group: "Game"; type: "ClickedGameBannder" }
  | { group: "Game"; type: "ClickedClose" }
  | { group: "Game"; type: "CancelledClose" }
  | { group: "Game"; type: "ConfirmedCloseGame" }
  | ({ group: "Game" } & GameMsg);

type GameMsg =
  | (Chess.Msg & { gameGroup: "Chess" })
  | (ConnectFour.Msg & { gameGroup: "ConnectFour" })
  | (TicTacToe.Msg & { gameGroup: "TicTacToe" })
  | (Snake.Msg & { gameGroup: "Snake" });

type OutMsg = Snackbar.Action;

const groupGameTag =
  <Msg, GameName extends string>(gameName: GameName) =>
  (msg: Msg): Msg & { gameGroup: GameName } => {
    return { ...msg, gameGroup: gameName } as const;
  };

export const OpenGame = (game: Game) => {
  return {
    group: "Game",
    type: "OpenGame",
    game,
  } as const;
};

type OpenGame = ReturnType<typeof OpenGame>;

export type Action = OpenGame;

export const runAction = (
  action: Action,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (action.type) {
    case "OpenGame":
      if (model.type === "Closed") {
        return initOpened(action);
      }

      if (action.game === model.child.type) {
        return [model, Route.push({ type: "Game" })];
      }

      return [model, Cmd.None];
  }
};

export const update = (
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutMsg[]] => {
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
): [Model, Cmd.Cmd<Msg>, OutMsg[]] => {
  if ("gameGroup" in msg) {
    const [modelChild, CmdChild] = updateGame(msg, model.child);

    return [{ ...model, child: modelChild }, CmdChild, []];
  }

  switch (msg.type) {
    case "ClickedClose":
      return [{ ...model, status: "ConfirmingClose" }, Cmd.None, []];

    case "ClickedGameBannder":
      return [model, Route.push({ type: "Game" }), []];

    case "CancelledClose":
      return [{ ...model, status: "Idle" }, Cmd.None, []];

    case "ConfirmedCloseGame":
      return [{ type: "Closed" }, Cmd.None, []];
  }
};

const updateGame = (
  msg: GameMsg,
  model: Opened["child"],
): [Opened["child"], Cmd.Cmd<Msg>] => {
  switch (model.type) {
    case "Chess":
      if (msg.gameGroup === "Chess") {
        const [modelChild, CmdChild] = Chess.update(msg, model.child);

        return [
          { type: "Chess", child: modelChild },
          pipe(
            CmdChild,
            Cmd.map((msg) => ({ ...msg, gameGroup: "Chess", group: "Game" })),
          ),
        ];
      }

      return [model, Cmd.None];

    case "ConnectFour":
      if (msg.gameGroup === "ConnectFour") {
        const [modelChild, CmdChild] = ConnectFour.update(msg, model.child);

        return [
          { type: "ConnectFour", child: modelChild },
          pipe(
            CmdChild,
            Cmd.map((msg) => ({
              ...msg,
              gameGroup: "ConnectFour",
              group: "Game",
            })),
          ),
        ];
      }
      return [model, Cmd.None];

    case "TicTacToe":
      if (msg.gameGroup === "TicTacToe") {
        const [modelChild, CmdChild] = TicTacToe.update(msg, model.child);

        return [
          { type: "TicTacToe", child: modelChild },
          pipe(
            CmdChild,
            Cmd.map((msg) => ({
              ...msg,
              gameGroup: "TicTacToe",
              group: "Game",
            })),
          ),
        ];
      }

      return [model, Cmd.None];

    case "Snake":
      if (msg.gameGroup === "Snake") {
        const [modelChild, CmdChild] = Snake.update(msg, model.child);

        return [
          { type: "Snake", child: modelChild },
          pipe(
            CmdChild,
            Cmd.map((msg) => ({ ...msg, gameGroup: "Snake", group: "Game" })),
          ),
        ];
      }

      return [model, Cmd.None];

    default:
      return exhaustive(model);
  }
};

const updateClosed = (
  msg: Msg,
  model: Closed,
): [Model, Cmd.Cmd<Msg>, OutMsg[]] => {
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
          return pipe(
            Snake.subscriptions(model.child.child),
            Sub.map((msg) => ({ ...msg, gameGroup: "Snake", group: "Game" })),
          );

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
      return pipe(
        Chess.view(model.child.child),
        UI.map((msg) => ({ ...msg, gameGroup: "Chess", group: "Game" })),
      );

    case "ConnectFour":
      return pipe(
        ConnectFour.view(model.child.child),
        UI.map((msg) => ({ ...msg, gameGroup: "ConnectFour", group: "Game" })),
      );

    case "TicTacToe":
      return pipe(
        TicTacToe.view(model.child.child),
        UI.map((msg) => ({ ...msg, gameGroup: "TicTacToe", group: "Game" })),
      );

    case "Snake":
      return pipe(
        Snake.view(model.child.child),
        UI.map((msg) => ({ ...msg, gameGroup: "Snake", group: "Game" })),
      );
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
            onClick={() =>
              dispatch({ group: "Game", type: "ClickedGameBannder" })
            }
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
          onConfirm: { group: "Game", type: "ConfirmedCloseGame" },
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
