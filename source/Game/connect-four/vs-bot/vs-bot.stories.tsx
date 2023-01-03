import { ComponentMeta, ComponentStory } from "@storybook/react"
import { ctx, userB } from "../../../test-data"
import { AppContainer } from "../../../UI"
import { emptyColumns } from "../connect-four/connect-four"
import { leftAndRightDiagonal } from "../connect-four/connect-four.test"
import { Model, View } from "./vs-bot.frontend"

const setupModel: Model = {
  type: "Setup",
  botLevel: "Medium",
  player: "None",
  userPlayerType: "PlayerOne",
  ghostIndex: "None",
  animationValue: {
    current: 0,
    target: 0,
    tension: 170,
    friction: 0.1,
    precision: 0.0001,
    velocity: 0,
  }
}

const props: Parameters<typeof View>[0] = {
  $send: () => { },
  ctx,
  goBack: () => { },
  model: setupModel,
}

export default {
  title: "Connect Four/VsBot",
  component: View,
  args: props,
} as ComponentMeta<typeof View>

const Template: ComponentStory<typeof View> = (args) => {
  return (
    <AppContainer themeMode="System">
      <View {...args} />
    </AppContainer>
  )
}

export const SetupMissingPlayer = Template.bind({})
SetupMissingPlayer.args = {
  model: setupModel,
}

export const SetupReady = Template.bind({})
SetupReady.args = {
  model: { ...setupModel, player: ctx.currentUserId },
}

const gameModel: Model = {
  ghostIndex: "None",
  animationValue: setupModel.animationValue,
  type: "Game",
  botLevel: "Medium",
  columns: emptyColumns,
  player: ctx.currentUserId,
  userPlayerType: "PlayerOne",
}

export const GameStarted = Template.bind({})
GameStarted.args = {
  model: gameModel,
}

export const TurnCurrentUser = Template.bind({})
TurnCurrentUser.args = {
  model: {
    ...gameModel,
    columns: [
      [],
      [],
      ["PlayerOne", "PlayerOne"],
      ["PlayerTwo"],
      ["PlayerTwo"],
      [],
      [],
    ],
  },
}

export const TurnBot = Template.bind({})
TurnBot.args = {
  model: {
    ...gameModel,
    columns: [[], [], ["PlayerOne", "PlayerOne"], ["PlayerTwo"], [], [], []],
  },
}

export const WonCurrentUser = Template.bind({})
WonCurrentUser.args = {
  model: {
    ...gameModel,
    columns: leftAndRightDiagonal,
  },
}

export const WonBot = Template.bind({})
WonBot.args = {
  model: {
    ...gameModel,
    userPlayerType: "PlayerTwo",
    columns: leftAndRightDiagonal,
  },
}

export const WinnerSpectating = Template.bind({})
WinnerSpectating.args = {
  model: {
    ...gameModel,
    player: userB.userId,
    columns: leftAndRightDiagonal,
  },
}


export const GameSpectating = Template.bind({})
GameSpectating.args = {
  model: {
    ...gameModel,
    player: userB.userId,
  },
}
