import { ComponentMeta, ComponentStory } from "@storybook/react"
import { ProfileAvatar, UserId, Username } from "../../Data"
import * as Store from "../../Store"
import * as UI from "../../UI"
import { View } from "./TicTacToe.Frontend"

// 
// 
// 
// Data
// 
// 
// 

const O: Store.Profile.Profile = {
    userId: UserId.generate(),
    avatarUrl: ProfileAvatar.toUrl({ seed: "123", style: "big-ears-neutral" }),
    name: "Fred",
    themeMode: "Light",
    username: Username.fromString("fred123"),
}

const X: Store.Profile.Profile = {
    userId: UserId.generate(),
    avatarUrl: ProfileAvatar.toUrl({ seed: "abc", style: "big-ears-neutral" }),
    name: "Bob",
    themeMode: "Light",
    username: Username.fromString("bob123"),
}

const currentUserId = X.userId

// 
// 
// 
// 
// 
// 
// 

export default {
    title: "TicTacToe",
    component: View,
} as ComponentMeta<typeof View>


const Template: ComponentStory<typeof View> = (args) => (
    <UI.AppContainer themeMode="System">
        <View
            currentUserId={currentUserId}
            dispatch={() => { }}
            goHome={() => { }}
            model={args.model}
            onCloseGame={() => { }}
            store={{
                ...Store.init,
                Profile: {
                    [X.userId]: X,
                    [O.userId]: O,
                }
            }}
            roomAvatarGroup={<>placeholder</>}
        />
    </UI.AppContainer>
)

export const GameSetup = Template.bind({})
GameSetup.args = {
    model: {
        type: "Setup",
        maxRoundCount: 3,
        moveTimeLimit: 5,
        O: O.userId,
        X: X.userId,
        openedModal: "None"
    }
}



export const GameStarting = Template.bind({})
GameStarting.args = {
    model: {
        type: "Game",
        maxRoundCount: 3,
        moveTimeLimit: 5,
        O: O.userId,
        X: X.userId,
        round: {
            type: "RoundStarting",
            countDown: 3
        },
        openedModal: "None"
    }
}


export const GameStarted = Template.bind({})
GameStarted.args = {
    model: {
        type: "Game",
        maxRoundCount: 3,
        moveTimeLimit: 5,
        O: O.userId,
        X: X.userId,
        round: {
            type: "RoundStarted",
            board: [
                ['O', 'X', 'O'],
                ['O', 'X', 'Empty'],
                ['X', 'Empty', 'Empty'],
            ],
            moveCountDown: 4,
        },
        openedModal: "None"
    }
}


export const RoundOverTie = Template.bind({})
RoundOverTie.args = {
    model: {
        type: "Game",
        maxRoundCount: 3,
        moveTimeLimit: 5,
        O: O.userId,
        X: X.userId,
        round: {
            type: "RoundOver",
            board: [
                ['O', 'X', 'O'],
                ['O', 'X', 'O'],
                ['X', 'O', 'X'],
            ],
            next: {
                type: "RoundStarting",
                countDown: 3
            },
            roundOver: {
                type: "Tie"
            }
        },
        openedModal: "None"
    }
}

export const RoundOverWin = Template.bind({})
RoundOverWin.args = {
    model: {
        type: "Game",
        maxRoundCount: 3,
        moveTimeLimit: 5,
        O: O.userId,
        X: X.userId,
        round: {
            type: "RoundOver",
            board: [
                ['O', 'X', 'O'],
                ['O', 'X', 'O'],
                ['X', 'X', 'Empty'],
            ],
            next: {
                type: "RoundStarting",
                countDown: 3
            },
            roundOver: {
                type: "Win",
                winner: "X"
            }
        },
        openedModal: "None"
    }
}


export const RoundOverWinOther = Template.bind({})
RoundOverWinOther.args = {
    model: {
        type: "Game",
        maxRoundCount: 3,
        moveTimeLimit: 5,
        O: O.userId,
        X: X.userId,
        round: {
            type: "RoundOver",
            board: [
                ['O', 'O', 'X'],
                ['X', 'O', 'O'],
                ['X', 'O', 'X'],
            ],
            next: {
                type: "RoundStarting",
                countDown: 3
            },
            roundOver: {
                type: "Win",
                winner: "O"
            }
        },
        openedModal: "None"
    }
}


export const GameOverTie = Template.bind({})
GameOverTie.args = {
    model: {
        type: "GameOver",
        maxRoundCount: 3,
        moveTimeLimit: 5,
        O: O.userId,
        X: X.userId,
        gameOver: {
            type: "Tie",
        },
        round: {
            type: "RoundOver",
            board: [
                ['O', 'O', 'X'],
                ['X', 'O', 'O'],
                ['X', 'O', 'X'],
            ],
            next: {
                type: "RoundStarting",
                countDown: 3
            },
            roundOver: {
                type: "Win",
                winner: "O"
            }
        },
        openedModal: "None"
    }
}
