import { ComponentMeta, ComponentStory } from "@storybook/react"
import { store, userA, userB, userC } from '../../../test-data'
import * as UI from "../../../UI"
import { emptyColumns, mapColumns, PlayerType } from "../ConnectFour"
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
    ghostIndex: "None",
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
    moveCountDown: 7,
    moveTimeLimit: 7,
    PlayerOne: currentUserId,
    PlayerTwo: userB.userId,
    ghostIndex: "None",
    openedModal: "None",
}

export const GameStarted = Template.bind({})
GameStarted.args = {
    model: {
        ...gameModel,
    }
}

export const ConfirmResign = Template.bind({})
ConfirmResign.args = {
    model: {
        ...gameModel,
        openedModal: "ConfirmResign"
    }
}



const p1: PlayerType = "PlayerOne"
const p2: PlayerType = "PlayerTwo"

const gameOverModel: Model = {
    type: "GameOver",
    columns: [
        [],
        [p1],
        [p2, p1, p2, p1],
        [p1, p2, p1],
        [p2, p1, p2, p1],
        [p1],
        [],
    ],
    gameOver: { type: "Winner", winner: p1 },
    moveTimeLimit: 7,
    ghostIndex: "None",
    openedModal: "None",
    PlayerOne: gameModel.PlayerOne,
    PlayerTwo: gameModel.PlayerTwo,
    rematch: { type: "NotAsking" }
}

export const CurrentUserWon = Template.bind({})
CurrentUserWon.args = {
    model: {
        ...gameOverModel,
    }
}

export const CurrentUserLost = Template.bind({})
CurrentUserLost.args = {
    model: {
        ...gameOverModel,
        columns: mapColumns(gameOverModel.columns, column => column.map(slot => slot === 'PlayerOne' ? 'PlayerTwo' : 'PlayerOne')),
        gameOver: {
            type: "Winner",
            winner: "PlayerTwo"
        }
    }
}

export const SpectatingWin = Template.bind({})
SpectatingWin.args = {
    model: {
        ...gameOverModel,
        PlayerOne: userC.userId,
    }
}

export const Tie = Template.bind({})
Tie.args = {
    model: {
        ...gameOverModel,
        columns: [
            [p1, p2, p1, p2, p1, p2],
            [p1, p2, p1, p2, p1, p2],
            [p1, p2, p1, p2, p1, p2],
            [p2, p1, p2, p1, p2, p1],
            [p1, p2, p1, p2, p1, p2],
            [p1, p2, p1, p2, p1, p2],
            [p1, p2, p1, p2, p1, p2],
        ],
        gameOver: {
            type: "Draw"
        }
    }
}


export const RematchRequesting = Template.bind({})
RematchRequesting.args = {
    model: {
        ...gameOverModel,
        rematch: { type: "Asking", asker: "PlayerOne" }
    }
}

export const RematchResponding = Template.bind({})
RematchResponding.args = {
    model: {
        ...gameOverModel,
        rematch: { type: "Asking", asker: "PlayerTwo" }
    }
}



export const ResignedCurrentUser = Template.bind({})
ResignedCurrentUser.args = {
    model: {
        ...gameOverModel,
        gameOver: { type: "Resignation", resigner: "PlayerOne" }
    }
}

export const ResignedOtherUser = Template.bind({})
ResignedOtherUser.args = {
    model: {
        ...gameOverModel,
        gameOver: { type: "Resignation", resigner: "PlayerTwo" }
    }
}

export const ResignedSpectating = Template.bind({})
ResignedSpectating.args = {
    model: {
        ...gameOverModel,
        gameOver: { type: "Resignation", resigner: "PlayerOne" },
        PlayerOne: userC.userId,
    }
}