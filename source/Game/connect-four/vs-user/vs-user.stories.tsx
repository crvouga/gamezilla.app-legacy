import { ComponentMeta, ComponentStory } from "@storybook/react"
import { ctx, userB, userC } from "../../../test-data"
import * as UI from "../../../UI"
import { emptyColumns, mapColumns, PlayerType } from "../connect-four/connect-four"
import { Model, View } from "./vs-user.frontend"

const setupModel: Model = {
  openedModal: "none",
  type: "Setup",
  moveTimeLimit: 7,
  ghostIndex: "none",
  PlayerOne: "none",
  PlayerTwo: "none",
}

const props: Parameters<typeof View>[0] = {
  ctx,
  $send: () => { },
  goBack: () => { },
  model: setupModel,
}

export default {
  title: "Connect Four/VsUser",
  component: View,
  args: props,
} as ComponentMeta<typeof View>

const Template: ComponentStory<typeof View> = (args) => {
  return (
    <UI.AppContainer themeMode="System">
      <View {...args} />
    </UI.AppContainer>
  )
}

export const MissingBoth = Template.bind({})
MissingBoth.args = {
  model: {
    ...setupModel,
  },
}

export const MissingPlayerOne = Template.bind({})
MissingPlayerOne.args = {
  model: {
    ...setupModel,
    PlayerTwo: ctx.currentUserId,
  },
}

export const MissingPlayerTwo = Template.bind({})
MissingPlayerTwo.args = {
  model: {
    ...setupModel,
    PlayerOne: ctx.currentUserId,
  },
}

export const SetupReady = Template.bind({})
SetupReady.args = {
  model: {
    ...setupModel,
    PlayerOne: ctx.currentUserId,
    PlayerTwo: userB.userId,
  },
}

const gameModel: Model = {
  type: "Game",
  columns: emptyColumns,
  moveCountDown: 7,
  moveTimeLimit: 7,
  PlayerOne: ctx.currentUserId,
  PlayerTwo: userB.userId,
  ghostIndex: "none",
  openedModal: "none",
}

export const GameStarted = Template.bind({})
GameStarted.args = {
  model: {
    ...gameModel,
  },
}

export const ConfirmResign = Template.bind({})
ConfirmResign.args = {
  model: {
    ...gameModel,
    openedModal: "ConfirmResign",
  },
}

const p1: PlayerType = "PlayerOne"
const p2: PlayerType = "PlayerTwo"

const gameOverModel: Model = {
  type: "GameOver",
  columns: [
    [],
    [p1],
    [p2, p1, p2, p1],
    [p1, p2, p1],
    [p2, p1, p2, p1],
    [p1],
    [],
  ],
  gameOver: { type: "Winner", winner: p1 },
  moveTimeLimit: 7,
  ghostIndex: "none",
  openedModal: "none",
  PlayerOne: gameModel.PlayerOne,
  PlayerTwo: gameModel.PlayerTwo,
  rematch: { type: "NotAsking" },
}

export const CurrentUserWon = Template.bind({})
CurrentUserWon.args = {
  model: {
    ...gameOverModel,
  },
}

export const CurrentUserLost = Template.bind({})
CurrentUserLost.args = {
  model: {
    ...gameOverModel,
    columns: mapColumns(gameOverModel.columns, (column) =>
      column.map((slot) => (slot === "PlayerOne" ? "PlayerTwo" : "PlayerOne")),
    ),
    gameOver: {
      type: "Winner",
      winner: "PlayerTwo",
    },
  },
}

export const SpectatingWin = Template.bind({})
SpectatingWin.args = {
  model: {
    ...gameOverModel,
    PlayerOne: userC.userId,
  },
}

export const Tie = Template.bind({})
Tie.args = {
  model: {
    ...gameOverModel,
    columns: [
      [p1, p2, p1, p2, p1, p2],
      [p1, p2, p1, p2, p1, p2],
      [p1, p2, p1, p2, p1, p2],
      [p2, p1, p2, p1, p2, p1],
      [p1, p2, p1, p2, p1, p2],
      [p1, p2, p1, p2, p1, p2],
      [p1, p2, p1, p2, p1, p2],
    ],
    gameOver: {
      type: "Draw",
    },
  },
}

export const RematchRequesting = Template.bind({})
RematchRequesting.args = {
  model: {
    ...gameOverModel,
    rematch: { type: "Asking", asker: "PlayerOne" },
  },
}

export const RematchResponding = Template.bind({})
RematchResponding.args = {
  model: {
    ...gameOverModel,
    rematch: { type: "Asking", asker: "PlayerTwo" },
  },
}

export const ResignedCurrentUser = Template.bind({})
ResignedCurrentUser.args = {
  model: {
    ...gameOverModel,
    gameOver: { type: "Resignation", resigner: "PlayerOne" },
  },
}

export const ResignedOtherUser = Template.bind({})
ResignedOtherUser.args = {
  model: {
    ...gameOverModel,
    gameOver: { type: "Resignation", resigner: "PlayerTwo" },
  },
}

export const ResignedSpectating = Template.bind({})
ResignedSpectating.args = {
  model: {
    ...gameOverModel,
    gameOver: { type: "Resignation", resigner: "PlayerOne" },
    PlayerOne: userC.userId,
  },
}
