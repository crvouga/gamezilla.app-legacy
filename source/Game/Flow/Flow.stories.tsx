import { ComponentMeta, ComponentStory } from "@storybook/react"
import * as UI from "../../UI"
import { emptyBoard, ViewBoard } from "./Flow"


export default {
    title: "Flow/Board",
    component: ViewBoard,
    args: {
        board: emptyBoard(9),
    }
} as ComponentMeta<typeof ViewBoard>


const Template: ComponentStory<typeof ViewBoard> = (args) => {
    return (
        <UI.AppContainer themeMode="System" >
            <ViewBoard {...args} />
        </UI.AppContainer>
    )
}


export const Empty = Template.bind({})

