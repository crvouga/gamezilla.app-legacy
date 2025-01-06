import { p } from '~/@/parser'
import { UserId } from '~/app/@/data/user-id'

export const MsgCore = p.or(
  p.obj({
    t: p.l('user-created-pack'),
    userId: UserId,
  }),
  p.obj({
    t: p.l('user-exited-pack-builder'),
  }),
  p.obj({
    t: p.l('user-exited-puzzle-builder'),
  }),
)

export type MsgCore = p.Infer<typeof MsgCore>
