import { ComponentMeta, ComponentStory } from '@storybook/react';
import { RemoteData } from '../../Core';
import { ProfileAvatar, UserId, Username } from "../../Data";
import * as Store from "../../Store";
import * as UI from "../../UI";
import { View } from "./Chess.Frontend";

// 
// 
// 
// Data
// 
// 
// 

const userA: Store.Profile.Profile = {
    userId: UserId.generate(),
    avatarUrl: ProfileAvatar.toUrl({ seed: "123", style: "big-ears-neutral" }),
    name: "Fred",
    themeMode: "Light",
    username: Username.fromString("fred123"),
}

const userB: Store.Profile.Profile = {
    userId: UserId.generate(),
    avatarUrl: ProfileAvatar.toUrl({ seed: "abc", style: "big-ears-neutral" }),
    name: "Bob",
    themeMode: "Light",
    username: Username.fromString("bob123"),
}

const userC: Store.Profile.Profile = {
    userId: UserId.generate(),
    avatarUrl: ProfileAvatar.toUrl({ seed: "someUser", style: "big-ears-neutral" }),
    name: "SomeUser",
    themeMode: "Light",
    username: Username.fromString("SomeUser"),
}

const currentUserId = userA.userId

// 
// 
// 
// 
// 
// 
// 

export default {
    title: "Chess/None",
    component: View,
    args: {
        currentUserId: currentUserId,
        dispatch: () => { },
        roomAvatarGroup: <>room</>,
        goHome: () => { },
        onCloseGame: () => { },
        store: {
            ...Store.init,
            Profile: {
                [userB.userId]: userB,
                [userA.userId]: userA,
                [userC.userId]: userC,
            }
        },
    }
} as ComponentMeta<typeof View>

const Template: ComponentStory<typeof View> = (args) => {
    return (
        <UI.AppContainer themeMode="System" >
            <View {...args} />
        </UI.AppContainer>
    )
}

export const Idle = Template.bind({})
Idle.args = {
    model: {
        mode: ["None"],
        requests: {
            InputMode: RemoteData.NotAsked
        }
    }
}

export const Loading = Template.bind({})
Loading.args = {
    model: {
        mode: ["None"],
        requests: {
            InputMode: RemoteData.Loading
        }
    }
}

