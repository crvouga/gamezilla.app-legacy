import { ComponentMeta, ComponentStory } from "@storybook/react"
import { ctx } from "../../../test-data"
import { AppContainer } from "../../../UI"
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
