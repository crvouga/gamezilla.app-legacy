import { s } from '~/@/schema'
import { UserId } from '~/app/@/data/user-id'

export const MsgSpace = s.or(
  s.obj({
    t: s.l('user-clicked-start-game'),
    userId: UserId,
  }),
  s.obj({
    t: s.l('user-added-bot-player'),
    userId: UserId,
  }),
  s.obj({
    t: s.l('user-removed-bot-player'),
    userId: UserId,
  }),
  s.obj({
    t: s.l('user-started-playing'),
    userId: UserId,
  }),
  s.obj({
    t: s.l('user-stopped-playing'),
    userId: UserId,
  }),
  s.obj({
    t: s.l('user-removed-user-player'),
    userId: UserId,
  }),
)

const Player = s.or(
  s.obj({
    t: s.l('user'),
    userId: UserId,
  }),
  s.obj({
    t: s.l('bot'),
  }),
)

export const ModelSpace = s.obj({
  players: s.arr(Player),
})

export type ModelSpace = s.Infer<typeof ModelSpace>
