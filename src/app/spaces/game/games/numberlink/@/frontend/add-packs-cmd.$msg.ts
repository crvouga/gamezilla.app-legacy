import { isOk } from '~/@/result'
import { s } from '~/@/schema'
import { Pack } from '../pack/pack'
import { PackId } from '../pack/pack-id'

export const schema = s.or(
  s.obj({
    t: s.l('numberlink.add-packs'),
    packs: s.dict(PackId, Pack),
    causedBy: s.any,
  }),
)

export type AddPacksCmd = s.Infer<typeof schema>

export type MsgShared = AddPacksCmd

export const init = (packs: { [packId: PackId]: Pack }, causedBy: unknown): AddPacksCmd => {
  return {
    t: 'numberlink.add-packs',
    packs,
    causedBy,
  }
}

const is = (cmd: unknown): cmd is AddPacksCmd => {
  return isOk(schema.parse(cmd))
}

const did = (output?: { msgOut?: unknown[] | null }): boolean => {
  return Boolean(
    output?.msgOut?.some((cmd) => {
      if (is(cmd)) {
        return true
      }
      return false
    }),
  )
}

export const AddPacksCmd = {
  is,
  init,
  did,
}
