import { ComponentMeta, ComponentStory } from "@storybook/react"
import { RemoteData } from "../../Core"
import { ctx } from "../../test-data"
import * as UI from "../../UI"
import { gameRoomCtx } from "../test-data"
import { View } from "./Chess.Frontend"

const props: Parameters<typeof View>[0] = {
  $send: () => { },
  ctx,
  gameRoomCtx,
  model: {
    mode: ["none"],
    requests: {
      InputMode: RemoteData.NotAsked,
    },
  },
}

export default {
  title: "Chess",
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

export const None = Template.bind({})
None.args = {}
