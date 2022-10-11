import { ComponentMeta, ComponentStory } from "@storybook/react"
import { store, userA, userB } from '../../../TestData'
import * as UI from "../../../UI"
import { Model, View } from "./UserVsUser.Frontend"

const currentUserId = userA.userId

export default {
    title: "Connect Four/UserVsUser",
    component: View,
    args: {
        currentUserId: currentUserId,
        store: store,
        roomAvatarGroup: <>room</>,
        goHome: () => { },
        dispatch: () => { },
        onClose: () => { },
    },
} as ComponentMeta<typeof View>

const Template: ComponentStory<typeof View> = (args) => {
    return (
        <UI.AppContainer themeMode="System" >
            <View {...args} />
        </UI.AppContainer>
    )
}

const setupModel: Model = {
    type: "Setup",
    moveTimeLimit: 7,
    playerOne: "None",
    playerTwo: "None"
}

export const Setup = Template.bind({})
Setup.args = {
    model: {
        ...setupModel
    }
}

