import * as Games from "../Games/Frontend";
import * as Route from "../Route";
import * as UI from "../UI";
import { Cmd } from "../Core";
import { GameName } from "../Games";

//
//
//
// Model
//
//
//

export type Model = {};

export const init: Model = {};

//
//
//
// Update
//
//
//

export type Msg = ["ClickedGame", GameName];

export type OutAction = Games.Action

export const update = (
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case "ClickedGame":
      const gameName = msg[1]
      return [model, Cmd.None, [["Games", ['Open', gameName]]]];
  }
};

//
//
//
// View
//
//
//

const isOpen = (game: Games.Model, gameName: GameName) => {
  return game.type === "Opened" && game.child.type === gameName;
};

const canOpen = (game: Games.Model, gameName: GameName) => {
  return game.type === "Closed" || isOpen(game, gameName);
};

export const view =
  (
    {
      profile,
      game,
      route,
    }: {
      profile: { avatarUrl: string };
      game: Games.Model;
      route: Route.Route;
    },
    _model: Model,
  ): UI.View<Msg> =>
    (dispatch) =>
    (
      <UI.Page>
        <UI.Header title="Home" />
        <UI.Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
          }}
        >
          <GameCard
            icon={<Games.GameIcon game="TicTacToe" />}
            label="Tic Tac Toe"
            disabled={!canOpen(game, "TicTacToe")}
            onClick={() => dispatch(["ClickedGame", "TicTacToe"])}
          />

          <GameCard
            icon={<Games.GameIcon game="ConnectFour" />}
            label="Connect Four"
            disabled={!canOpen(game, "ConnectFour")}
            onClick={() => dispatch(["ClickedGame", "ConnectFour"])}
          />

          <GameCard
            icon={<Games.GameIcon game="Chess" />}
            label="Chess"
            disabled={!canOpen(game, "Chess")}
            onClick={() => dispatch(["ClickedGame", "Chess"])}
          />

          <GameCard
            icon={<Games.GameIcon game="Snake" />}
            label="Snake"
            disabled={!canOpen(game, "Snake")}
            onClick={() => dispatch(["ClickedGame", "Snake"])}
          />
        </UI.Box>
      </UI.Page>
    );

const GameCard = ({
  icon,
  label,
  onClick,
  disabled = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) => {
  return (
    <UI.ButtonBase
      disabled={disabled}
      sx={{
        position: "relative",
        overflow: "hidden",
        opacity: disabled ? 0.3 : 1,
      }}
      onClick={onClick}
    >
      {icon}

      <UI.Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
        }}
      >
        <UI.Box
          sx={{
            width: "100%",
            padding: 1,
            paddingTop: 2,
            background: `linear-gradient(transparent, rgba(0, 0, 0, 0.6))`,
          }}
        >
          <UI.Typography color="white" align="left" fontWeight={800}>
            {label}
          </UI.Typography>
        </UI.Box>
      </UI.Box>
    </UI.ButtonBase>
  );
};
