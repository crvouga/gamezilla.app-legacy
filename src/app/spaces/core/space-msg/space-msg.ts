import { s } from '~/@/schema'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import { GameName } from '../../game/games/@/game-name'
import * as Game from '../../game/games/types'

export const MsgSpace = s.or(
  s.obj({
    t: s.l('user-started-space'),
    userId: UserId,
    spaceId: SpaceId,
  }),
  s.obj({
    t: s.l('user-ended-space'),
    userId: UserId,
    spaceId: SpaceId,
  }),
  s.obj({
    t: s.l('user-joined-space'),
    userId: UserId,
    spaceId: SpaceId,
  }),
  s.obj({
    t: s.l('user-left-space'),
    userId: UserId,
    spaceId: SpaceId,
  }),
  s.obj({
    t: s.l('user-inputted-game'),
    userId: UserId,
    spaceId: SpaceId,
    game: s.maybe(GameName),
  }),
  s.obj({
    t: s.l('game'),
    spaceId: SpaceId,
    c: Game.MsgSpace,
  }),
)

export type MsgSpace = s.Infer<typeof MsgSpace>
