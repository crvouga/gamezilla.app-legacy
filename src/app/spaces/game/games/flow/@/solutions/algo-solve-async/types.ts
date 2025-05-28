import { s } from '~/@/schema'
import * as Variant from '../../variant/variant'

export const MsgToWorker = s.or(
  s.obj({
    t: s.l('find-solution'),
    model: Variant.Model,
  }),
)
export type MsgToWorker = s.Infer<typeof MsgToWorker>

export const MsgToMaster = s.or(
  s.obj({
    t: s.l('found-solution'),
    model: s.maybe(Variant.Model),
  }),
)
export type MsgToMaster = s.Infer<typeof MsgToMaster>
