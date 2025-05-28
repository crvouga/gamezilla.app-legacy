import { p } from '~/@/parser'
import { isOk } from '~/@/result'
import { Pack } from '../pack/pack'
import { PackId } from '../pack/pack-id'

export const parser = p.or(
  p.obj({
    t: p.l('add-packs'),
    packs: p.dict(PackId, Pack),
    causedBy: p.any,
  }),
)

export type AddPacksCmd = p.Infer<typeof parser>

export const init = (packs: { [packId: PackId]: Pack }, causedBy: unknown): AddPacksCmd => {
  return {
    t: 'add-packs',
    packs,
    causedBy,
  }
}

const is = (cmd: unknown): cmd is AddPacksCmd => {
  return isOk(parser.parse(cmd))
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
