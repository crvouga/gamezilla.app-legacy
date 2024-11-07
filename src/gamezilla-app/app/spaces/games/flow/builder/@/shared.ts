import { p } from '@/core/parser'
import { UserId } from 'gamezilla-app/app/@/data'

export const MsgCore = p.or(
  p.obj({
    t: p.l('user-created-pack'),
    userId: UserId
  }),
  p.obj({
    t: p.l('user-exited-pack-builder')
  }),
  p.obj({
    t: p.l('user-exited-puzzle-builder')
  })
)

export type MsgCore = p.Infer<typeof MsgCore>
