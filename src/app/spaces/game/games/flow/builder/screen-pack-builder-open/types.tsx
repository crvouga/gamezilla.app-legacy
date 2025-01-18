import { p } from '~/@/parser'
import { Pack } from '../../@/pack/pack'
import { CreateNewPackTypes } from './create-new-pack'
import { UserId } from '~/app/@/data/user-id'
import { PackListTypes } from '../../@/pack/pack-list'

export type ModelFrontend = CreateNewPackTypes.ModelFrontend & {}

export const initFrontend: ModelFrontend = {
  ...CreateNewPackTypes.initFrontend,
}

export type MsgFrontend =
  | CreateNewPackTypes.MsgFrontend
  | {
      t: 'screen-pack-builder-open.got-pack-list-msg'
      c: PackListTypes.MsgFrontend
    }

export const MsgSpace = p.or(
  CreateNewPackTypes.MsgSpace,
  p.obj({
    t: p.l('screen-pack-builder-open.user-clicked-pack-item'),
    pack: Pack,
    userId: UserId,
  }),
)
export type MsgSpace = p.Infer<typeof MsgSpace>

export type MsgBackend = CreateNewPackTypes.MsgBackend

export type MsgToBackend = CreateNewPackTypes.MsgToBackend

export type MsgToFrontend = CreateNewPackTypes.MsgToFrontend

export const ModelSpace = p.and(p.obj({}), CreateNewPackTypes.ModelSpace)
export type ModelSpace = p.Infer<typeof ModelSpace>
