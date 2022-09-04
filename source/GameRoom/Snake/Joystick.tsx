import { Joystick, } from "react-joystick-component"




export type Direction = "Up" | "Down" | "Left" | "Right"


export type MoveEvent = {
    direction: Direction
}



export const ViewJoystick = ({ onMove }: { onMove: (moveEvent: MoveEvent) => void }) => {

    return <Joystick move={(joystickEvent) => {

        const direction: Direction = joystickEvent.direction === 'BACKWARD' ? 'Down' : joystickEvent.direction === 'FORWARD' ? 'Up' : joystickEvent.direction === 'LEFT' ? 'Left' : 'Right'

        onMove({
            direction
        })

    }} />
}