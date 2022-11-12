import { ComponentMeta, ComponentStory } from "@storybook/react"
import { profileStore, userA, userB, userC } from "../test-data"
import * as UI from "../UI"
import { View, init } from "./GameRoom.Frontend"
import { FrontendRoom } from "./GameRoom.Types"
import * as Game from "./Game.Frontend"
import { Cmd } from "../Core"
import { RoomId } from "../Data"

const roomA: FrontendRoom = {
    game: Game.init({ gameName: "Chess", sendToBackend: () => Cmd.None })[0],
    hostId: userB.userId,
    roomId: RoomId.generate()
}

const roomB: FrontendRoom = {
    game: Game.init({ gameName: "ConnectFour", sendToBackend: () => Cmd.None })[0],
    hostId: userC.userId,
    roomId: RoomId.generate()
}

export default {
    title: "Game Room",
    component: View,
    args: {
        bottomNav: <>bottom nav</>,
        currentUserId: userA.userId,
        dispatch: () => { },
        model: init[0],
        profileStore: profileStore
    },
} as ComponentMeta<typeof View>


const Template: ComponentStory<typeof View> = (args) => {
    return (
        <UI.AppContainer themeMode="System" >
            <View {...args} />
        </UI.AppContainer>
    )
}


export const NoActiveRooms = Template.bind({})
NoActiveRooms.args = {
    model: {
        ...init[0],
    }
}

export const SomeActiveRooms = Template.bind({})
SomeActiveRooms.args = {
    model: {
        ...init[0],
        rooms: {
            [roomA.roomId]: roomA,
            [roomB.roomId]: roomB,
        },
        users: {
            [roomA.hostId]: {
                roomId: roomA.roomId,
                userId: roomA.hostId
            },
            [roomB.hostId]: {
                roomId: roomB.roomId,
                userId: roomB.hostId
            }
        }
    }
}