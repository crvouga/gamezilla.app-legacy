import { ComponentMeta, ComponentStory } from "@storybook/react"
import { p } from "../../../Core"
import { currentUserId, profileStore, userB } from "../../../test-data"
import * as UI from "../../../UI"
import { emptyBoard, setSlot } from "../TicTacToe"
import { View } from "./UserVsBot.Frontend"





//
//
//
//
//
//
//

export default {
  title: "TicTacToe / UserVsBot",
  component: View,
  args: {
    currentUserId: currentUserId,
    $d: () => { },
    roomComponent: <>room</>,
    goHome: () => { },
    store: profileStore,
  },
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
  model: {
    type: "Setup",
    botLevel: "Medium",
    userPlayerType: "X",
    player: currentUserId,
  },
}

export const SetupNoPlayer = Template.bind({})
SetupNoPlayer.args = {
  model: {
    type: "Setup",
    botLevel: "Medium",
    userPlayerType: "X",
    player: "None",
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
    player: currentUserId,
  },
}

export const GameBotTurn = Template.bind({})
GameBotTurn.args = {
  model: {
    type: "Game",
    botLevel: "Medium",
    userPlayerType: "X",
    board: p(emptyBoard, (board) =>
      setSlot(board, { column: 0, row: 0 }, "X"),
    ),
    player: currentUserId,
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
    player: currentUserId,
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
    player: currentUserId,
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
    player: currentUserId,
  },
}
