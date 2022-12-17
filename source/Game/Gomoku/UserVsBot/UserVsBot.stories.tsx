import { ComponentMeta, ComponentStory } from "@storybook/react"
import { ctx } from "../../../test-data"
import { AppContainer } from "../../../UI"
import { Board } from "../Gomoku/Gomoku"
import { init, view } from "./UserVsBot.Frontend"

const props: Parameters<typeof view>[0] = {
    ctx: ctx,
    model: init,
    onBack: () => { },
    $d: () => { },
}

export default {
    title: "Gomoku / UserVsBot",
    component: view,
    args: props,
} as ComponentMeta<typeof view>

const Template: ComponentStory<typeof view> = (args) => AppContainer({
    themeMode: "System",
    children: view(args)
})

export const Setup = Template.bind({})
Setup.args = {
    model: {
        ...init,
        userId: ctx.currentUserId
    },
}



const board: Board = {
    6: {
        6: 'white',
        7: 'white',
        8: 'black',
    },
    7: {
        7: 'black',
        8: 'white',
        9: 'black',
    },
    8: {
        7: 'white',
        8: 'black',
        9: 'white',
    },
}

export const Game = Template.bind({})
Game.args = {
    model: {
        type: "game",
        board: board,
        botLevel: "Medium",
        userId: ctx.currentUserId,
        userStone: "white"
    },
}
