import * as Games from "Games"
import * as Route from "Route"
import * as View from "View"
import { Cmd, Navigation } from "Core"

//
//
//
// Model
//
//
//

export type Model = {}

export const init: Model = {}

//
//
//
// Update
//
//
//

export type Msg =
  | { type: "UserClickedAvatar" }
  | { type: "UserClickedChatButton" }
  | { type: "UserClickedGame"; game: Games.Game }

export type OutMsg = Games.GroupedMsg

export const update = (
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutMsg[]] => {
  switch (msg.type) {
    case "UserClickedAvatar":
      return [model, Navigation.push(Route.encode({ type: "Account" })), []]

    case "UserClickedGame":
      return [model, Cmd.none, [Games.UserOpenedGame(msg.game)]]

    case "UserClickedChatButton":
      return [model, Navigation.push(Route.encode({ type: "Chat" })), []]
  }
}

//
//
//
// View
//
//
//

const isOpen = (game: Games.Model, gameName: Games.Game) => {
  return game.type === "Opened" && game.child.type === gameName
}

const canOpen = (game: Games.Model, gameName: Games.Game) => {
  return game.type === "Closed" || isOpen(game, gameName)
}

export const view =
  (
    { profile, game }: { profile: { avatarUrl: string }; game: Games.Model },
    _model: Model,
  ): View.View<Msg> =>
  (dispatch) =>
    (
      <View.Page>
        <View.Toolbar>
          <View.Typography sx={{ flex: 1 }} variant="h6">
            Home
          </View.Typography>

          <View.IconButton
            sx={{ marginRight: 1 }}
            onClick={() => dispatch({ type: "UserClickedChatButton" })}
          >
            <View.Icons.Chat />
          </View.IconButton>

          <View.Avatar
            onClick={() => dispatch({ type: "UserClickedAvatar" })}
            src={profile.avatarUrl}
          />
        </View.Toolbar>

        <View.Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
          }}
        >
          <GameCard
            icon={<Games.TicTacToe.Icon />}
            label="Tic Tac Toe"
            disabled={!canOpen(game, "TicTacToe")}
            onClick={() =>
              dispatch({
                type: "UserClickedGame",
                game: "TicTacToe",
              })
            }
          />

          <GameCard
            icon={<Games.ConnectFour.Icon />}
            label="Connect Four"
            disabled={!canOpen(game, "ConnectFour")}
            onClick={() =>
              dispatch({
                type: "UserClickedGame",
                game: "ConnectFour",
              })
            }
          />

          <GameCard
            icon={<Games.Chess.Icon />}
            label="Chess"
            disabled={!canOpen(game, "Chess")}
            onClick={() => dispatch({ type: "UserClickedGame", game: "Chess" })}
          />

          <GameCard
            icon={<Games.Snake.Icon />}
            label="Snake"
            disabled={!canOpen(game, "Snake")}
            onClick={() => dispatch({ type: "UserClickedGame", game: "Snake" })}
          />
        </View.Box>
      </View.Page>
    )

const GameCard = ({
  icon,
  label,
  onClick,
  disabled = false,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  disabled?: boolean
}) => {
  return (
    <View.ButtonBase
      disabled={disabled}
      sx={{
        position: "relative",
        overflow: "hidden",
        opacity: disabled ? 0.3 : 1,
      }}
      onClick={onClick}
    >
      {icon}

      <View.Box
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
        <View.Box
          sx={{
            width: "100%",
            padding: 1,
            paddingTop: 2,
            background: `linear-gradient(transparent, rgba(0, 0, 0, 0.6))`,
          }}
        >
          <View.Typography color="white" align="left" fontWeight={800}>
            {label}
          </View.Typography>
        </View.Box>
      </View.Box>
    </View.ButtonBase>
  )
}
