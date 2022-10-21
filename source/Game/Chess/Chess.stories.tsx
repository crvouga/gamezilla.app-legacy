import { ComponentMeta, ComponentStory } from "@storybook/react"
import { RemoteData } from "../../Core"
import { currentUserId, store } from "../../test-data"
import * as UI from "../../UI"
import { View } from "./Chess.Frontend"

export default {
  title: "Chess",
  component: View,
  args: {
    currentUserId: currentUserId,
    dispatch: () => { },
    roomComponent: <>room</>,
    goHome: () => { },
    store: store,
  },
} as ComponentMeta<typeof View>

const Template: ComponentStory<typeof View> = (args) => {
  return (
    <UI.AppContainer themeMode="System">
      <View {...args} />
    </UI.AppContainer>
  )
}

export const None = Template.bind({})
None.args = {
  model: {
    mode: ["None"],
    requests: {
      InputMode: RemoteData.NotAsked,
    },
  },
}
