import { p } from '~/@/schema'

export const MsgSpace = p.or(
  p.obj({
    t: p.l('user-clicked-copy-to-clipboard'),
  }),
  p.obj({
    t: p.l('copied-to-clipboard'),
  }),
)
