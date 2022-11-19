import { ComponentMeta, ComponentStory } from "@storybook/react"
import { profileStore, userA, userB } from '../../../test-data'
import { leftAndRightDiagonal } from '../test-data'
import * as UI from "../../../UI"
import { emptyColumns } from "../ConnectFour"
import { Model, View } from "./UserVsBot.Frontend"

const currentUserId = userA.userId

export default {
    title: "Connect Four/UserVsBot",
    component: View,
    args: {
        currentUserId: currentUserId,
        store: profileStore,
        roomComponent: <>room</>,
        goHome: () => { },
        $d: () => { },
        onClose: () => { },
        goBack: () => { },
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
    botLevel: "Medium",
    player: "None",
    userPlayerType: "PlayerOne"
}

export const SetupMissingPlayer = Template.bind({})
SetupMissingPlayer.args = {
    model: setupModel
}

export const SetupReady = Template.bind({})
SetupReady.args = {
    model: { ...setupModel, player: currentUserId }
}

const gameModel: Model = {
    type: "Game",
    botLevel: "Medium",
    columns: emptyColumns,
    player: currentUserId,
    userPlayerType: "PlayerOne"
}

export const GameStarted = Template.bind({})
GameStarted.args = {
    model: gameModel
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
            []
        ]
    }
}

export const TurnBot = Template.bind({})
TurnBot.args = {
    model: {
        ...gameModel,
        columns: [
            [],
            [],
            ["PlayerOne", "PlayerOne"],
            ["PlayerTwo",],
            [],
            [],
            []
        ]
    }
}


export const WonCurrentUser = Template.bind({})
WonCurrentUser.args = {
    model: {
        ...gameModel,
        columns: leftAndRightDiagonal
    }
}

export const WonBot = Template.bind({})
WonBot.args = {
    model: {
        ...gameModel,
        userPlayerType: "PlayerTwo",
        columns: leftAndRightDiagonal
    }
}


export const WinnerSpectating = Template.bind({})
WinnerSpectating.args = {
    model: {
        ...gameModel,
        player: userB.userId,
        columns: leftAndRightDiagonal
    }
}
