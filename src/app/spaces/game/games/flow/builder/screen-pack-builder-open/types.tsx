import { p } from '~/@/parser'
import { Pack } from '../../@/pack/pack'
import { CreateNewPackTypes } from './create-new-pack'
import { UserId } from '~/app/@/data/user-id'

export type ModelClient = CreateNewPackTypes.ModelClient & {}

export const initClient: ModelClient = {
  ...CreateNewPackTypes.initClient
}

export type MsgClient = CreateNewPackTypes.MsgClient

export const MsgCore = p.or(
  CreateNewPackTypes.MsgCore,
  p.obj({
    t: p.l('screen-pack-builder-open.user-clicked-pack-item'),
    pack: Pack,
    userId: UserId
  })
)
export type MsgCore = p.Infer<typeof MsgCore>

export type MsgServer = CreateNewPackTypes.MsgServer

export type MsgToServer = CreateNewPackTypes.MsgToServer

export type MsgToClient = CreateNewPackTypes.MsgToClient

export const ModelCore = p.and(p.obj({}), CreateNewPackTypes.ModelCore)
export type ModelCore = p.Infer<typeof ModelCore>
