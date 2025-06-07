import { s } from '~/@/schema'
import { UserId } from '~/app/@/data/user-id'

export const MsgSpace = s.or(
  s.obj({
    t: s.l('create-new-pack.user-created-pack'),
    userId: UserId,
  }),
  s.obj({
    t: s.l('user-exited-pack-builder'),
  }),
  s.obj({
    t: s.l('user-exited-puzzle-builder'),
  }),
)

export type MsgSpace = s.Infer<typeof MsgSpace>
