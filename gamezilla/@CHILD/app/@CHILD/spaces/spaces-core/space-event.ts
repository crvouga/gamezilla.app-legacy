import { SpaceId, UserId } from "gamezilla/@CHILD/app/@SHARED/data"
import * as Game from "../@CHILD/game/game.core"

export type SpaceEvent =
    | {
          t: "user-started-space"
          userId: UserId
          spaceId: SpaceId
      }
    | {
          t: "user-ended-space"
          userId: UserId
          spaceId: SpaceId
      }
    | {
          t: "user-joined-space"
          userId: UserId
          spaceId: SpaceId
      }
    | {
          t: "user-left-space"
          userId: UserId
          spaceId: SpaceId
      }
    | {
          t: "user-inputted-game"
          userId: UserId
          spaceId: SpaceId
          game: Game.GameName | null
      }
    | {
          t: "game"
          spaceId: SpaceId
          c: Game.MsgGame
      }
