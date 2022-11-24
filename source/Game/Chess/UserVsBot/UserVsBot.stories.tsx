import { ComponentMeta, ComponentStory } from "@storybook/react"
import { ctx } from "../../../test-data"
import * as UI from "../../../UI"
import { Model, View } from "./UserVsBot.Frontend"

const setupModel: Model = {
  isFlipped: false,
  openedMenuId: { type: "None" },
  openedModal: "None",
  sharedModel: {
    type: "Setup",
    botLevel: 2,
    userColor: "w",
    userId: "None",
  },
}

const props: Parameters<typeof View>[0] = {
  ctx,
  $d: () => {},
  onClose: () => {},
  model: setupModel,
}

export default {
  title: "Chess/UserVsBot",
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

export const Setup = Template.bind({})
Setup.args = {
  model: {
    ...setupModel,
  },
}
