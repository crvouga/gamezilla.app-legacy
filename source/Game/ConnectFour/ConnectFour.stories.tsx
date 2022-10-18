import { ComponentMeta, ComponentStory } from "@storybook/react"
import * as UI from "../../UI"
import { emptyColumns, ViewColumns } from "./ConnectFour"
import { horizontal, horizontalLongest, leftAndRightDiagonal, leftDiagonal, rightDiagonal, tie, vertical } from "./test-data"

export default {
    title: "Connect Four/Columns",
    component: ViewColumns,
    args: {
        columns: emptyColumns,
        onClick: () => { }
    }
} as ComponentMeta<typeof ViewColumns>


const Template: ComponentStory<typeof ViewColumns> = (args) => {
    return (
        <UI.AppContainer themeMode="System" >
            <ViewColumns {...args} />
        </UI.AppContainer>
    )
}


export const HorizontalWin = Template.bind({})
HorizontalWin.args = {
    columns: horizontal
}

export const VerticalWin = Template.bind({})
VerticalWin.args = {
    columns: vertical
}

export const LongestHorizontalWin = Template.bind({})
LongestHorizontalWin.args = {
    columns: horizontalLongest
}

export const LeftDiagonalWin = Template.bind({})
LeftDiagonalWin.args = {
    columns: leftDiagonal
}

export const RightDiagonalWin = Template.bind({})
RightDiagonalWin.args = {
    columns: rightDiagonal
}

export const LeftAndRightDiagonalWin = Template.bind({})
LeftAndRightDiagonalWin.args = {
    columns: leftAndRightDiagonal
}

export const Tie = Template.bind({})
Tie.args = {
    columns: tie
}


