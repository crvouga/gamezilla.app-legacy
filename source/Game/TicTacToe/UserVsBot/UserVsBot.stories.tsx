import { ComponentMeta, ComponentStory } from '@storybook/react';
import { ProfileAvatar, UserId, Username } from "../../../Data";
import * as Store from "../../../Store";
import * as UI from "../../../UI";
import { Model, View } from "./UserVsBot.Frontend";

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
    title: "TicTacToe/UserVsBot",
    component: View,
    args: {
        currentUserId: currentUserId,
        dispatch: () => { },
        roomAvatarGroup: <>room</>,
        goHome: () => { },
        // onCloseGame: () => { },
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
        <UI.AppContainer themeMode="System">
            <View {...args} />
        </UI.AppContainer>
    )
}

export const GameSetupCurrentPlayer = Template.bind({})
GameSetupCurrentPlayer.args = {
    model: {
        type: "Setup",
        botLevel: "Medium",
        userPlayerType: "X",
        player: currentUserId
    }
}

export const GameSetupNoPlayer = Template.bind({})
GameSetupNoPlayer.args = {
    model: {
        type: "Setup",
        botLevel: "Medium",
        userPlayerType: "X",
        player: "None"
    }
}

export const GameSetupOtherPlayer = Template.bind({})
GameSetupOtherPlayer.args = {
    model: {
        type: "Setup",
        botLevel: "Medium",
        userPlayerType: "X",
        player: userB.userId
    }
}