import { p } from 'gamezilla-app/@/core/parser'
import { FlowPack } from '../../@/pack/pack'
import { CreateNewPackTypes } from './create-new-pack'

export type ModelClient = CreateNewPackTypes.ModelClient & {}

export const initClient: ModelClient = {
  ...CreateNewPackTypes.initClient
}

export type MsgClient =
  | CreateNewPackTypes.MsgClient
  | {
      t: 'pack-list.clicked-pack-item'
      pack: FlowPack
    }

export const MsgCore = p.or(
  CreateNewPackTypes.MsgCore,
  p.obj({
    t: p.l('pack-list.user-clicked-pack-item'),
    pack: FlowPack
  })
)
export type MsgCore = p.Infer<typeof MsgCore>

export type MsgServer = CreateNewPackTypes.MsgServer | { t: 'noop' }

export type MsgToServer = CreateNewPackTypes.MsgToServer | { t: 'noop' }

export type MsgToClient = CreateNewPackTypes.MsgToClient | { t: 'noop' }

export const ModelCore = p.and(p.obj({}), CreateNewPackTypes.ModelCore)
export type ModelCore = p.Infer<typeof ModelCore>
