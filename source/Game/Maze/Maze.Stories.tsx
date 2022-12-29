import { ComponentMeta, ComponentStory } from "@storybook/react"
import { ctx } from "../../test-data"
import { AppContainer } from "../../UI"
import { init, View } from "./Maze.Frontend"

const initial = init({ userId: ctx.currentUserId })

const props: Parameters<typeof View>[0] = {
  $send: () => { },
  model: initial,
  ctx,
}

export default { title: "Maze", component: View, args: props } as ComponentMeta<
  typeof View
>

const Template: ComponentStory<typeof View> = (args) => {
  return (
    <AppContainer themeMode="System">
      <View {...args} />
    </AppContainer>
  )
}

export const Initial = Template.bind({})
Initial.args = {}

export const Game = Template.bind({})
Game.args = {
  model: {
    type: "Game",
    lower: initial.lower,
    seed: initial.seed,
    upper: initial.upper,
    players: {
      [ctx.currentUserId]: {
        position: {
          x: 0,
          y: 0,
        },
        color: "Red",
        userId: ctx.currentUserId,
        direction: "North",
      },
    },
  },
}
