import { pipe } from "fp-ts/lib/function";
import { cmd, sub } from "Framework";
import { Cmd } from "Framework/Cmd";
import { Sub } from "Framework/Sub";
import * as Games from "Games";
import * as Navigation from "Framework/Navigation";
import * as Route from "Route";
import * as Snackbar from "Snackbar";
import { exhaustive } from "Utility";
import * as View from "View";

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
    | { type: "TicTacToe"; child: Games.TicTacToe.Model }
    | { type: "ConnectFour"; child: Games.ConnectFour.Model }
    | { type: "Chess"; child: Games.Chess.Model }
    | { type: "Snake"; child: Games.Snake.Model };
};

export type Game = Opened["child"]["type"];

//
// init
//

export const init: Model = { type: "Closed" };

const initOpened = ({ game }: { game: Game }): [Opened, Cmd<Msg>, OutMsg[]] => {
  return [
    { type: "Opened", status: "Idle", child: initGame({ game }) },
    Navigation.push(Route.encode({ type: "Game" })),
    [],
  ];
};

const initGame = ({ game }: { game: Game }): Opened["child"] => {
  switch (game) {
    case "Chess":
      return { type: "Chess", child: Games.Chess.init };

    case "ConnectFour":
      return { type: "ConnectFour", child: Games.ConnectFour.init };

    case "TicTacToe":
      return { type: "TicTacToe", child: Games.TicTacToe.init };

    case "Snake":
      return { type: "Snake", child: Games.Snake.init };
  }
};

//
//
//
// Update
//
//
//

export type GroupedMsg = { group: "Game" } & Msg;

type Msg =
  | { type: "UserOpenedGame"; game: Game }
  | { type: "UserClickedGameBanner" }
  | { type: "UserClickedCloseGameButton" }
  | { type: "CancelledCloseGame" }
  | { type: "ConfirmedCloseGame" }
  | GameMsg;

type GameMsg =
  | (Games.Chess.Msg & { gameGroup: "Chess" })
  | (Games.ConnectFour.Msg & { gameGroup: "ConnectFour" })
  | (Games.TicTacToe.Msg & { gameGroup: "TicTacToe" })
  | (Games.Snake.Msg & { gameGroup: "Snake" });

type OutMsg = Snackbar.GroupedMsg;

const groupGameTag =
  <Msg, GameName extends string>(gameName: GameName) =>
  (msg: Msg): Msg & { gameGroup: GameName } => {
    return { ...msg, gameGroup: gameName } as const;
  };

export const UserOpenedGame = (game: Game): GroupedMsg => {
  return {
    group: "Game",
    type: "UserOpenedGame",
    game,
  };
};

export const update = (msg: Msg, model: Model): [Model, Cmd<Msg>, OutMsg[]] => {
  switch (model.type) {
    case "Closed":
      return updateClosed(msg, model);

    case "Opened":
      return updateOpened(msg, model);
  }
};

const updateOpened = (msg: Msg, model: Opened): [Model, Cmd<Msg>, OutMsg[]] => {
  if ("gameGroup" in msg) {
    const [modelChild, cmdChild] = updateGame(msg, model.child);

    return [{ ...model, child: modelChild }, cmdChild, []];
  }

  switch (msg.type) {
    case "UserOpenedGame":
      if (msg.game === model.child.type) {
        return [model, Navigation.push(Route.encode({ type: "Game" })), []];
      }
      return [
        model,
        cmd.none,
        [Snackbar.EnqueuedSnackbar("A game is already opened.")],
      ];

    case "UserClickedCloseGameButton":
      return [{ ...model, status: "ConfirmingClose" }, cmd.none, []];

    case "UserClickedGameBanner":
      return [model, Navigation.push(Route.encode({ type: "Game" })), []];

    case "CancelledCloseGame":
      return [{ ...model, status: "Idle" }, cmd.none, []];

    case "ConfirmedCloseGame":
      return [{ type: "Closed" }, cmd.none, []];
  }
};

const updateGame = (
  msg: GameMsg,
  model: Opened["child"]
): [Opened["child"], cmd.Cmd<Msg>] => {
  switch (model.type) {
    case "Chess":
      if (msg.gameGroup === "Chess") {
        const [modelChild, cmdChild] = Games.Chess.update(msg, model.child);

        return [
          { type: "Chess", child: modelChild },
          pipe(cmdChild, cmd.map(groupGameTag("Chess"))),
        ];
      }

      return [model, cmd.none];

    case "ConnectFour":
      if (msg.gameGroup === "ConnectFour") {
        const [modelChild, cmdChild] = Games.ConnectFour.update(
          msg,
          model.child
        );

        return [
          { type: "ConnectFour", child: modelChild },
          pipe(cmdChild, cmd.map(groupGameTag("ConnectFour"))),
        ];
      }
      return [model, cmd.none];

    case "TicTacToe":
      if (msg.gameGroup === "TicTacToe") {
        const [modelChild, cmdChild] = Games.TicTacToe.update(msg, model.child);

        return [
          { type: "TicTacToe", child: modelChild },
          pipe(cmdChild, cmd.map(groupGameTag("TicTacToe"))),
        ];
      }

      return [model, cmd.none];

    case "Snake":
      if (msg.gameGroup === "Snake") {
        const [modelChild, cmdChild] = Games.Snake.update(msg, model.child);

        return [
          { type: "Snake", child: modelChild },
          pipe(cmdChild, cmd.map(groupGameTag("Snake"))),
        ];
      }

      return [model, cmd.none];

    default:
      return exhaustive(model);
  }
};

const updateClosed = (msg: Msg, model: Closed): [Model, Cmd<Msg>, OutMsg[]] => {
  switch (msg.type) {
    case "UserOpenedGame":
      return initOpened(msg);

    default:
      return [model, cmd.none, []];
  }
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (model: Model): Sub<Msg> => {
  switch (model.type) {
    case "Closed":
      return sub.none;

    case "Opened":
      switch (model.child.type) {
        case "Chess":
          return sub.none;

        case "ConnectFour":
          return sub.none;

        case "Snake":
          return pipe(
            Games.Snake.subscriptions(model.child.child),
            sub.map(groupGameTag("Snake"))
          );

        case "TicTacToe":
          return sub.none;
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

export const view = (model: Model): View.View<Msg> => {
  switch (model.type) {
    case "Closed":
      return viewClosed;

    case "Opened":
      return viewOpened(model);
  }
};

const viewOpened = (model: Opened): View.View<Msg> => {
  switch (model.child.type) {
    case "Chess":
      return pipe(
        Games.Chess.view(model.child.child),
        View.map(groupGameTag("Chess"))
      );

    case "ConnectFour":
      return pipe(
        Games.ConnectFour.view(model.child.child),
        View.map(groupGameTag("ConnectFour"))
      );

    case "TicTacToe":
      return pipe(
        Games.TicTacToe.view(model.child.child),
        View.map(groupGameTag("TicTacToe"))
      );

    case "Snake":
      return pipe(
        Games.Snake.view(model.child.child),
        View.map(groupGameTag("Snake"))
      );
  }
};

const viewClosed: View.View<Msg> = () => {
  return <>game is closed</>;
};

export const viewBanner =
  (model: Opened): View.View<Msg> =>
  (dispatch) =>
    (
      <>
        <View.Box
          sx={{
            width: "100%",
            display: "flex",
            alignItems: "center",
          }}
        >
          <View.ButtonBase
            sx={{ flex: 1 }}
            onClick={() => dispatch({ type: "UserClickedGameBanner" })}
          >
            <View.Box sx={{ width: "20%", marginRight: 2 }}>
              <GameIcon game={model.child.type} />
            </View.Box>
            <View.Typography align="left" sx={{ flex: 1 }}>
              {gameToName(model.child.type)}
            </View.Typography>
          </View.ButtonBase>

          <View.ButtonBase
            sx={{ width: "15%", height: "100%", p: 2 }}
            onClick={() =>
              dispatch({
                type: "UserClickedCloseGameButton",
              })
            }
          >
            <View.Icons.Close />
          </View.ButtonBase>
        </View.Box>

        <View.ConformationDialog
          open={model.status === "ConfirmingClose"}
          title={`Close ${gameToName(model.child.type)}?`}
          confirmTitle="Close Game"
          onClose={() => dispatch({ type: "CancelledCloseGame" })}
          onCancel={() => dispatch({ type: "CancelledCloseGame" })}
          onConfirm={() => dispatch({ type: "ConfirmedCloseGame" })}
        />
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
      return <Games.Chess.Icon />;

    case "ConnectFour":
      return <Games.ConnectFour.Icon />;

    case "TicTacToe":
      return <Games.TicTacToe.Icon />;

    case "Snake":
      return <Games.Snake.Icon />;
  }
};
