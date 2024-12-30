import { p } from '~/@/parser'
import { UserId } from '~/app/@/data/user-id'
import { SpaceId } from '~/app/@/data/space-id'
import { GameName } from '../games/@/game-name'
import * as Game from '../games/types'

export const SpaceEvent = p.or(
  p.obj({
    t: p.l('user-started-space'),
    userId: UserId,
    spaceId: SpaceId
  }),
  p.obj({
    t: p.l('user-ended-space'),
    userId: UserId,
    spaceId: SpaceId
  }),
  p.obj({
    t: p.l('user-joined-space'),
    userId: UserId,
    spaceId: SpaceId
  }),
  p.obj({
    t: p.l('user-left-space'),
    userId: UserId,
    spaceId: SpaceId
  }),
  p.obj({
    t: p.l('user-inputted-game'),
    userId: UserId,
    spaceId: SpaceId,
    game: p.maybe(GameName)
  }),
  p.obj({
    t: p.l('game'),
    spaceId: SpaceId,
    c: Game.MsgCore
  })
)

export type SpaceEvent = p.Infer<typeof SpaceEvent>
