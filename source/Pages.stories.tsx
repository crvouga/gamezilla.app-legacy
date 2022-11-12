import { ComponentMeta, ComponentStory } from "@storybook/react"
import * as GameRoom from "./Game/GameRoom.Frontend"
import { initReady, ViewReady } from "./Pages"
import * as Party from "./Party/Party.Frontend"
import { chatStore, userA } from "./test-data"
import * as UI from "./UI"

export default {
    title: "Page/Ready",
    component: ViewReady,
    args: {
        dispatch: () => { },
        chatStore: chatStore,
        profile: userA,
        gameRoom: GameRoom.init[0],
        party: Party.init()[0],
    },
} as ComponentMeta<typeof ViewReady>


const Template: ComponentStory<typeof ViewReady> = (args) => {
    return (
        <UI.AppContainer themeMode="System" >
            <ViewReady {...args} />
        </UI.AppContainer>
    )
}


export const Home = Template.bind({})
Home.args = {
    model: initReady(['Home'], userA)[0],
    route: ['Home']
}

export const Chat = Template.bind({})
Chat.args = {
    model: initReady(['Chat'], userA)[0],
    route: ['Chat']
}

export const Search = Template.bind({})
Search.args = {
    model: initReady(['Search'], userA)[0],
    route: ['Search']
}