import { ComponentMeta, ComponentStory } from "@storybook/react"
import { RemoteData } from "../../Core"
import { currentUserId, profileStore } from "../../test-data"
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
    profileStore: profileStore,
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
