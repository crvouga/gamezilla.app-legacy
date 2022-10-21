import { ComponentMeta, ComponentStory } from "@storybook/react"
import { Some } from "../../../Core/Option"
import { store, userA, userB } from '../../../test-data'
import * as UI from "../../../UI"
import { Model, View } from "./UserVsUser.Frontend"

const currentUserId = userA.userId



export default {
    title: "Chess/UserVsUser",
    component: View,
    args: {
        currentUserId: currentUserId,
        store: store,
        roomComponent: <>room</>,
        goHome: () => { },
        dispatch: () => { },
        onClose: () => { },
    },
} as ComponentMeta<typeof View>

const Template: ComponentStory<typeof View> = (args) => {
    return (
        <UI.AppContainer themeMode="System" >
            <View {...args} />
        </UI.AppContainer>
    )
}

const setupModel: Model = {
    isFlipped: false,
    openedMenuId: { type: "None" },
    openedModal: "None",
    sharedModel: {
        type: "Setup",
        b: { type: "None" },
        w: { type: "None" },
        clockPreset: "Bullet"
    }
}

export const Setup = Template.bind({})
Setup.args = {
    model: {
        ...setupModel
    }
}


export const MissingWhite = Template.bind({})
MissingWhite.args = {
    model: {
        ...setupModel,
        sharedModel: {
            type: "Setup",
            w: { type: "None" },
            b: Some(userB.userId),
            clockPreset: "Blitz",
        }
    }
}


export const MissingBlack = Template.bind({})
MissingBlack.args = {
    model: {
        ...setupModel,
        sharedModel: {
            type: "Setup",
            w: Some(userB.userId),
            b: { type: "None" },
            clockPreset: "Blitz",
        }
    }
}


export const SetupReady = Template.bind({})
SetupReady.args = {
    model: {
        ...setupModel,
        sharedModel: {
            type: "Setup",
            w: Some(userB.userId),
            b: Some(userA.userId),
            clockPreset: "Blitz",
        }
    }
}
