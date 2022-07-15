import * as Route from "Route";
import * as Snackbar from "Snackbar";
import * as UI from "UI";
import { keyframes } from "@mui/system";
import { Cmd, Sub, pipe } from "Core";
import { exhaustive, tag } from "Utility";
import * as Chess from "./Chess";
import * as ConnectFour from "./ConnectFour";
import * as Snake from "./Snake";
import * as TicTacToe from "./TicTacToe/Frontend";
import {
  Closed,
  FrontendModel,
  FrontendMsg,
  GameName,
  Opened,
  ToFrontend,
} from "./Types";

//
//
//
// Model
//
//
//

export type Model = FrontendModel;

//
//
//
// Init
//
//
//

export const init: Model = { type: "Closed" };

const initOpened = ({ game }: { game: GameName }): [Opened, Cmd.Cmd<Msg>] => {
  const [child, childCmd] = initGame({ game });
  return [
    { type: "Opened", status: "Idle", child },
    Cmd.batch([Route.push({ type: "Game" }), childCmd]),
  ];
};

const initGame = ({
  game,
}: {
  game: GameName;
}): [Opened["child"], Cmd.Cmd<Msg>] => {
  switch (game) {
    case "Chess":
      return [{ type: "Chess", child: Chess.init }, Cmd.None];

    case "ConnectFour":
      return [{ type: "ConnectFour", child: ConnectFour.init }, Cmd.None];

    case "TicTacToe": {
      const [child, childCmd] = TicTacToe.init;
      return [
        { type: "TicTacToe", child: child },
        pipe(childCmd, Cmd.map(tag("TicTacToe"))),
      ];
    }

    case "Snake":
      return [{ type: "Snake", child: Snake.init }, Cmd.None];
  }
};

//
//
//
// Msg
//
//
//

export type Msg = FrontendMsg;

type OutAction = ["Snackbar", Snackbar.Action];

export type Action = Open | Close;

export const Open = (game: GameName) =>
  ({ group: "Game", type: "Open", game } as const);
export type Open = ReturnType<typeof Open>;

export const Close = (game: GameName) =>
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
  { authUserId }: { authUserId: string },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  switch (model.type) {
    case "Closed":
      return updateClosed(msg, model);

    case "Opened":
      return updateOpened({ authUserId }, msg, model);
  }
};

export const updateFromBackend = (
  msg: ToFrontend,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (model.type) {
    case "Closed":
      return [model, Cmd.None];

    case "Opened":
      const [childNew, childCmd] = updateGameFromBackend(msg, model.child);
      return [{ ...model, child: childNew }, childCmd];
  }
};

const updateGameFromBackend = (
  msg: ToFrontend,
  model: Opened["child"],
): [Opened["child"], Cmd.Cmd<Msg>] => {
  switch (model.type) {
    case "Chess":
      return [model, Cmd.None];

    case "ConnectFour":
      return [model, Cmd.None];

    case "Snake":
      return [model, Cmd.None];

    case "TicTacToe":
      if (msg[0] === "TicTacToe") {
        const [modelChild, cmdChild] = TicTacToe.updateFromBackend(
          msg[1],
          model.child,
        );

        return [
          { type: "TicTacToe", child: modelChild },
          pipe(cmdChild, Cmd.map(tag("TicTacToe"))),
        ];
      }

      return [model, Cmd.None];

    default:
      return exhaustive(model);
  }
};

const updateOpened = (
  { authUserId }: { authUserId: string },
  msg: Msg,
  model: Opened,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case "ClickedClose":
      return [{ ...model, status: "ConfirmingClose" }, Cmd.None, []];

    case "ClickedBanner":
      return [model, Route.push({ type: "Game" }), []];

    case "CancelledClose":
      return [{ ...model, status: "Idle" }, Cmd.None, []];

    case "ConfirmedClose":
      return [{ type: "Closed" }, Cmd.None, []];

    case "Chess":
    case "ConnectFour":
    case "Snake":
    case "TicTacToe":
      const [child, childCmd] = updateGame({ authUserId }, msg, model.child);
      return [{ ...model, child }, childCmd, []];
  }
};

const updateGame = (
  { authUserId }: { authUserId: string },
  msg: Msg,
  model: Opened["child"],
): [Opened["child"], Cmd.Cmd<Msg>] => {
  switch (model.type) {
    case "Chess":
      if (msg[0] === "Chess") {
        const [modelChild, cmdChild] = Chess.update(msg[1], model.child);
        return [
          { type: "Chess", child: modelChild },
          pipe(cmdChild, Cmd.map(tag("Chess"))),
        ];
      }
      return [model, Cmd.None];

    case "ConnectFour":
      if (msg[0] === "ConnectFour") {
        const [modelChild, cmdChild] = ConnectFour.update(msg[1], model.child);

        return [
          { type: "ConnectFour", child: modelChild },
          pipe(cmdChild, Cmd.map(tag("ConnectFour"))),
        ];
      }
      return [model, Cmd.None];

    case "TicTacToe":
      if (msg[0] === "TicTacToe") {
        const [modelChild, cmdChild] = TicTacToe.update(
          { authUserId },
          msg[1],
          model.child,
        );

        return [
          { type: "TicTacToe", child: modelChild },
          pipe(cmdChild, Cmd.map(tag("TicTacToe"))),
        ];
      }

      return [model, Cmd.None];

    case "Snake":
      if (msg[0] === "Snake") {
        const [modelChild, cmdChild] = Snake.update(msg[1], model.child);

        return [
          { type: "Snake", child: modelChild },
          pipe(cmdChild, Cmd.map(tag("Snake"))),
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
          return pipe(
            Snake.subscriptions(model.child.child),
            Sub.map(tag("Snake")),
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

export const view = (
  { currentUserId }: { currentUserId: string },
  model: Model,
): UI.View<Msg> => {
  switch (model.type) {
    case "Closed":
      return viewClosed;

    case "Opened":
      return viewOpened({ currentUserId }, model);
  }
};

const viewOpened = (
  { currentUserId }: { currentUserId: string },
  model: Opened,
): UI.View<Msg> => {
  switch (model.child.type) {
    case "Chess":
      return pipe(Chess.view(model.child.child), UI.map(tag("Chess")));

    case "ConnectFour":
      return pipe(
        ConnectFour.view(model.child.child),
        UI.map(tag("ConnectFour")),
      );

    case "TicTacToe":
      return pipe(
        TicTacToe.view({ currentUserId }, model.child.child),
        UI.map(tag("TicTacToe")),
      );

    case "Snake":
      return pipe(Snake.view(model.child.child), UI.map(tag("Snake")));
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
            onClick={() => dispatch(["ClickedBanner"])}
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
            onClick={() => dispatch(["ClickedClose"])}
          >
            <UI.Icons.Close />
          </UI.ButtonBase>
        </UI.Paper>

        {UI.conformationDialog<Msg>({
          open: model.status === "ConfirmingClose",
          title: `Close ${gameToName(model.child.type)}?`,
          confirmTitle: `Close ${gameToName(model.child.type)}`,
          onClose: ["CancelledClose"],
          onCancel: ["CancelledClose"],
          onConfirm: ["ConfirmedClose"],
        })(dispatch)}
      </>
    );

export const gameToName = (game: GameName): string => {
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

export const GameIcon = ({ game }: { game: GameName }) => {
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
