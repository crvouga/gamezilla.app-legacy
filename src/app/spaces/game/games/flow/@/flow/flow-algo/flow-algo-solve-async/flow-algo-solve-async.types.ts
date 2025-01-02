import { p } from '~/@/parser'
import { Variant } from '../../flow-variant'

export const MsgToWorker = p.or(
  p.obj({
    t: p.l('find-solution'),
    model: Variant.Model
  })
)
export type MsgToWorker = p.Infer<typeof MsgToWorker>

export const MsgToMaster = p.or(
  p.obj({
    t: p.l('found-solution'),
    model: p.maybe(Variant.Model)
  })
)
export type MsgToMaster = p.Infer<typeof MsgToMaster>
