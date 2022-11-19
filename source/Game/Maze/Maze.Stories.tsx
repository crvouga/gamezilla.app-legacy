import { ComponentMeta, ComponentStory } from "@storybook/react"
import { profileStore } from "../../test-data"
import { AppContainer } from "../../UI"
import { init, View } from "./Maze.Frontend"


export default {
    title: "Maze / UserVsUser",
    component: View,
    args: {
        $d: () => { },
        model: init,
        profiles: profileStore.profiles
    },
} as ComponentMeta<typeof View>


const Template: ComponentStory<typeof View> = (args) => {
    return (
        <AppContainer themeMode="System" >
            <View {...args} />
        </AppContainer>
    )
}


export const Initial = Template.bind({})
Initial.args = {
}

