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
    PlayerOne: "None",
    PlayerTwo: "None"
}

export const MissingBoth = Template.bind({})
MissingBoth.args = {
    model: {
        ...setupModel
    }
}

export const MissingPlayerOne = Template.bind({})
MissingPlayerOne.args = {
    model: {
        ...setupModel,
        PlayerTwo: currentUserId
    }
}

export const MissingPlayerTwo = Template.bind({})
MissingPlayerTwo.args = {
    model: {
        ...setupModel,
        PlayerOne: currentUserId
    }
}

export const Ready = Template.bind({})
Ready.args = {
    model: {
        ...setupModel,
        PlayerOne: currentUserId,
        PlayerTwo: userB.userId,
    }
}

