import { WithEventId } from '~/@/event-sourced/event'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import { GamesTypes } from './games'
import { ExitGameCmd } from './games/@/exit-game-cmd'
import { GameName } from './games/@/game-name'

export type Msg =
  | {
      t: 'game_gotGameMsg'
      spaceId: SpaceId
      c: GamesTypes.Msg
    }
  | {
      t: 'game_clickedGameTile'
      gameName: GameName
      userId: UserId
      spaceId: SpaceId
    }
  | {
      t: 'game_gotExitGameCmd'
      c: ExitGameCmd
    }
  | {
      t: 'game_gotMsgSpace'
      c: WithEventId<GamesTypes.MsgSpace>
      spaceId: SpaceId
    }
