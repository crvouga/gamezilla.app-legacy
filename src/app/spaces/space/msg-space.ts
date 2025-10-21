import { s } from '~/@/schema'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import { GameName } from '../game/games/@/game-name'
import * as Game from '../game/games/types'
import { Sub } from '~/@/sub'
import { WithEventId } from '~/@/event-sourced/event'

export const MsgSpace = s.or(
  s.obj({
    t: s.l('userStartedSpace'),
    userId: UserId,
    spaceId: SpaceId,
  }),
  s.obj({
    t: s.l('userEndedSpace'),
    userId: UserId,
    spaceId: SpaceId,
  }),
  s.obj({
    t: s.l('userJoinedSpace'),
    userId: UserId,
    spaceId: SpaceId,
  }),
  s.obj({
    t: s.l('userLeftSpace'),
    userId: UserId,
    spaceId: SpaceId,
  }),
  s.obj({
    t: s.l('userInputtedGame'),
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

export const spaceMsgs = Sub.queued<WithEventId<MsgSpace>>()
