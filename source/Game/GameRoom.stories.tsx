import { ComponentMeta, ComponentStory } from "@storybook/react"
import { Cmd } from "../Core"
import { RoomId } from "../Data"
import { ctx, userB, userC } from "../test-data"
import * as UI from "../UI"
import * as Game from "./Game.Frontend"
import { init, ViewPageGame } from "./GameRoom.Frontend"
import { FrontendRoom } from "./GameRoom.Types"

const roomA: FrontendRoom = {
  game: Game.init({ gameName: "Chess", sendToBackend: () => Cmd.None })[0],
  hostId: userB.userId,
  roomId: RoomId.generate(),
}

const roomB: FrontendRoom = {
  game: Game.init({
    gameName: "connect-four",
    sendToBackend: () => Cmd.None,
  })[0],
  hostId: userC.userId,
  roomId: RoomId.generate(),
}

const props: Parameters<typeof ViewPageGame>[0] = {
  $send: () => { },
  model: init[0],
  ctx,
}

export default {
  title: "Game Room",
  component: ViewPageGame,
  args: props,
} as ComponentMeta<typeof ViewPageGame>

const Template: ComponentStory<typeof ViewPageGame> = (args) => {
  return (
    <UI.AppContainer themeMode="System">
      <ViewPageGame {...args} />
    </UI.AppContainer>
  )
}

export const NoActiveRooms = Template.bind({})
NoActiveRooms.args = {
  model: {
    ...init[0],
  },
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
        userId: roomA.hostId,
      },
      [roomB.hostId]: {
        roomId: roomB.roomId,
        userId: roomB.hostId,
      },
    },
  },
}
