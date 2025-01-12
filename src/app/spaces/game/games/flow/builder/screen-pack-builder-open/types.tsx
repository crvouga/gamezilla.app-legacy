import { p } from '~/@/parser'
import { Pack } from '../../@/pack/pack'
import { CreateNewPackTypes } from './create-new-pack'
import { UserId } from '~/app/@/data/user-id'

export type ModelFrontend = CreateNewPackTypes.ModelFrontend & {}

export const initFrontend: ModelFrontend = {
  ...CreateNewPackTypes.initFrontend,
}

export type MsgFrontend = CreateNewPackTypes.MsgFrontend

export const MsgCore = p.or(
  CreateNewPackTypes.MsgCore,
  p.obj({
    t: p.l('screen-pack-builder-open.user-clicked-pack-item'),
    pack: Pack,
    userId: UserId,
  }),
)
export type MsgCore = p.Infer<typeof MsgCore>

export type MsgBackend = CreateNewPackTypes.MsgBackend

export type MsgToBackend = CreateNewPackTypes.MsgToBackend

export type MsgToFrontend = CreateNewPackTypes.MsgToFrontend

export const ModelCore = p.and(p.obj({}), CreateNewPackTypes.ModelCore)
export type ModelCore = p.Infer<typeof ModelCore>
