import { p } from '~/@/schema'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import { GameName } from '../../game/games/@/game-name'
import * as Game from '../../game/games/types'

export const MsgSpace = p.or(
  p.obj({
    t: p.l('user-started-space'),
    userId: UserId,
    spaceId: SpaceId,
  }),
  p.obj({
    t: p.l('user-ended-space'),
    userId: UserId,
    spaceId: SpaceId,
  }),
  p.obj({
    t: p.l('user-joined-space'),
    userId: UserId,
    spaceId: SpaceId,
  }),
  p.obj({
    t: p.l('user-left-space'),
    userId: UserId,
    spaceId: SpaceId,
  }),
  p.obj({
    t: p.l('user-inputted-game'),
    userId: UserId,
    spaceId: SpaceId,
    game: p.maybe(GameName),
  }),
  p.obj({
    t: p.l('game'),
    spaceId: SpaceId,
    c: Game.MsgSpace,
  }),
)

export type MsgSpace = p.Infer<typeof MsgSpace>
