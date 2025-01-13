import { p } from '~/@/parser'
import { UserId } from '~/app/@/data/user-id'

export const MsgSpace = p.or(
  p.obj({
    t: p.l('user-clicked-start-game'),
    userId: UserId,
  }),
  p.obj({
    t: p.l('user-added-bot-player'),
    userId: UserId,
  }),
  p.obj({
    t: p.l('user-removed-bot-player'),
    userId: UserId,
  }),
  p.obj({
    t: p.l('user-started-playing'),
    userId: UserId,
  }),
  p.obj({
    t: p.l('user-stopped-playing'),
    userId: UserId,
  }),
  p.obj({
    t: p.l('user-removed-user-player'),
    userId: UserId,
  }),
)

const Player = p.or(
  p.obj({
    t: p.l('user'),
    userId: UserId,
  }),
  p.obj({
    t: p.l('bot'),
  }),
)

export const ModelSpace = p.obj({
  players: p.arr(Player),
})

export type ModelSpace = p.Infer<typeof ModelSpace>
