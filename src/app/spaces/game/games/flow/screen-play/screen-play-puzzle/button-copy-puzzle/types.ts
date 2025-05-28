import { s } from '~/@/schema'

export const MsgSpace = s.or(
  s.obj({
    t: s.l('user-clicked-copy-to-clipboard'),
  }),
  s.obj({
    t: s.l('copied-to-clipboard'),
  }),
)
