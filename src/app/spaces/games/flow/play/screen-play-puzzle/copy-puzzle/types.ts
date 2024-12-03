import { p } from '~/@/core/parser'

export const MsgCore = p.or(
  p.obj({
    t: p.l('user-clicked-copy-to-clipboard')
  }),
  p.obj({
    t: p.l('copied-to-clipboard')
  })
)
