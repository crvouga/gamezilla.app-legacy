import { ComponentMeta, ComponentStory } from "@storybook/react"
import { ctx } from "../../test-data"
import * as UI from "../../UI"
import { View } from "./TicTacToe.Frontend"

const props: Parameters<typeof View>[0] = {
    $d: () => { },
    ctx,
    model: { mode: "None" }
}

export default {
    title: "TicTacToe",
    component: View,
    args: props
} as ComponentMeta<typeof View>


const Template: ComponentStory<typeof View> = (args) => {
    return (
        <UI.AppContainer themeMode="System" >
            <View {...args} />
        </UI.AppContainer>
    )
}


export const None = Template.bind({})
None.args = {}