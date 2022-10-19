import { ComponentMeta, ComponentStory } from "@storybook/react"
import { store, userA, userB } from '../../../TestData'
import * as UI from "../../../UI"
import { emptyColumns } from "../ConnectFour"
import { Model, View } from "./UserVsUser.Frontend"

const currentUserId = userA.userId

export default {
    title: "Connect Four/UserVsUser",
    component: View,
    args: {
        currentUserId: currentUserId,
        store: store,
        roomComponent: <>room</>,
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
    openedModal: "None",
    type: "Setup",
    moveTimeLimit: 7,
    columnIndex: "None",
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

export const SetupReady = Template.bind({})
SetupReady.args = {
    model: {
        ...setupModel,
        PlayerOne: currentUserId,
        PlayerTwo: userB.userId,
    }
}

const gameModel: Model = {
    type: "Game",
    columns: emptyColumns,
    moveCountDown: 3,
    moveTimeLimit: 7,
    PlayerOne: currentUserId,
    PlayerTwo: userB.userId,
    columnIndex: "None",
    openedModal: "None",
}

export const GameStarted = Template.bind({})
GameStarted.args = {
    model: {
        ...gameModel,
    }
}