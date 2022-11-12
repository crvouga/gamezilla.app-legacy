import { ComponentMeta, ComponentStory } from "@storybook/react"
import { userA, profileStore } from "../../test-data"
import * as UI from "../../UI"
import { View } from "./TicTacToe.Frontend"

const currentUserId = userA.userId

export default {
    title: "TicTacToe",
    component: View,
    args: {
        currentUserId: currentUserId,
        dispatch: () => { },
        roomComponent: <>room</>,
        goHome: () => { },
        onCloseGame: () => { },
        store: profileStore

    }
} as ComponentMeta<typeof View>


const Template: ComponentStory<typeof View> = (args) => {
    return (
        <UI.AppContainer themeMode="System" >
            <View {...args} />
        </UI.AppContainer>
    )
}


export const None = Template.bind({})

None.args = {
    model: {
        mode: "None"
    }
}