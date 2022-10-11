import { ComponentMeta, ComponentStory } from "@storybook/react"
import * as TestData from "../../TestData"
import * as UI from "../../UI"
import { View } from "./ConnectFour.Frontend"


const currentUserId = TestData.userA.userId

export default {
    title: "Connect Four",
    component: View,
    args: {
        currentUserId: currentUserId,
        dispatch: () => { },
        roomButton: <></>,
        goHome: () => { },
        onCloseGame: () => { },
        roomComponent: <>room</>
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
        type: "None",
    }
}