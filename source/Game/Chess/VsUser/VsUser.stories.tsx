import { ComponentMeta, ComponentStory } from "@storybook/react"
import { ctx, userA, userB } from "../../../test-data"
import * as UI from "../../../UI"
import { Model, View } from "./VsUser.Frontend"

const setupModel: Model = {
  isFlipped: false,
  openedMenuId: { type: "None" },
  openedModal: "None",
  sharedModel: {
    type: "Setup",
    b: "None",
    w: "None",
    clockPreset: "Bullet",
  },
}

const props: Parameters<typeof View>[0] = {
  ctx,
  $send: () => { },
  onClose: () => { },
  model: setupModel,
}

export default {
  title: "Chess/VsUser",
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

export const MissingWhite = Template.bind({})
MissingWhite.args = {
  model: {
    ...setupModel,
    sharedModel: {
      type: "Setup",
      w: "None",
      b: userB.userId,
      clockPreset: "Blitz",
    },
  },
}

export const MissingBlack = Template.bind({})
MissingBlack.args = {
  model: {
    ...setupModel,
    sharedModel: {
      type: "Setup",
      w: userB.userId,
      b: "None",
      clockPreset: "Blitz",
    },
  },
}

export const SetupReady = Template.bind({})
SetupReady.args = {
  model: {
    ...setupModel,
    sharedModel: {
      type: "Setup",
      w: userB.userId,
      b: userA.userId,
      clockPreset: "Blitz",
    },
  },
}
