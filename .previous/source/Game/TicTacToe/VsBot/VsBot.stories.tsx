import { ComponentMeta, ComponentStory } from "@storybook/react"
import { p } from "../../../Core"
import { ctx, userB } from "../../../test-data"
import * as UI from "../../../UI"
import { emptyBoard, setSlot } from "../TicTacToe/TicTacToe"
import { Model, View } from "./VsBot.Frontend"

const modelSetup: Model = {
  type: "Setup",
  botLevel: "Medium",
  userPlayerType: "X",
  player: ctx.currentUserId,
}

const props: Parameters<typeof View>[0] = {
  $send: () => { },
  ctx,
  goBack: () => { },
  model: modelSetup,
}

export default {
  title: "TicTacToe / VsBot",
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

export const SetupCurrentPlayer = Template.bind({})
SetupCurrentPlayer.args = {
  model: modelSetup,
}

export const SetupNoPlayer = Template.bind({})
SetupNoPlayer.args = {
  model: {
    type: "Setup",
    botLevel: "Medium",
    userPlayerType: "X",
    player: "none",
  },
}

export const SetupOtherPlayer = Template.bind({})
SetupOtherPlayer.args = {
  model: {
    type: "Setup",
    botLevel: "Medium",
    userPlayerType: "X",
    player: userB.userId,
  },
}

export const GameCurrentUserTurn = Template.bind({})
GameCurrentUserTurn.args = {
  model: {
    type: "Game",
    botLevel: "Medium",
    userPlayerType: "X",
    board: emptyBoard,
    player: ctx.currentUserId,
  },
}

export const GameBotTurn = Template.bind({})
GameBotTurn.args = {
  model: {
    type: "Game",
    botLevel: "Medium",
    userPlayerType: "X",
    board: p(emptyBoard, (board) => setSlot(board, { column: 0, row: 0 }, "X")),
    player: ctx.currentUserId,
  },
}

export const CurrentUserLost = Template.bind({})
CurrentUserLost.args = {
  model: {
    type: "Game",
    botLevel: "Medium",
    userPlayerType: "O",
    board: [
      ["X", "O", "_"],
      ["X", "O", "_"],
      ["X", "_", "_"],
    ],
    player: ctx.currentUserId,
  },
}

export const CurrentUserWon = Template.bind({})
CurrentUserWon.args = {
  model: {
    type: "Game",
    botLevel: "Medium",
    userPlayerType: "X",
    board: [
      ["X", "O", "_"],
      ["X", "O", "_"],
      ["X", "_", "_"],
    ],
    player: ctx.currentUserId,
  },
}

export const OtherPlayerWon = Template.bind({})
OtherPlayerWon.args = {
  model: {
    type: "Game",
    botLevel: "Medium",
    userPlayerType: "X",
    board: [
      ["X", "O", "_"],
      ["X", "O", "_"],
      ["X", "_", "_"],
    ],
    player: userB.userId,
  },
}

export const OtherPlayerLost = Template.bind({})
OtherPlayerLost.args = {
  model: {
    type: "Game",
    botLevel: "Medium",
    userPlayerType: "O",
    board: [
      ["X", "O", "_"],
      ["X", "O", "_"],
      ["X", "_", "_"],
    ],
    player: userB.userId,
  },
}

export const Tie = Template.bind({})
Tie.args = {
  model: {
    type: "Game",
    botLevel: "Medium",
    userPlayerType: "O",
    board: [
      ["X", "O", "X"],
      ["X", "O", "X"],
      ["O", "X", "O"],
    ],
    player: ctx.currentUserId,
  },
}
