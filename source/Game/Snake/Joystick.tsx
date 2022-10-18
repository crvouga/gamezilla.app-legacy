export type Direction = "Up" | "Down" | "Left" | "Right"

export type MoveEvent = {
  direction: Direction
}

export const ViewJoystick = ({
  onMove,
}: {
  onMove: (moveEvent: MoveEvent) => void
}) => {
  return (
    <>joystick</>
  )
}
