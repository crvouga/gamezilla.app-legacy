import { UserId } from '~/app/@/data'
import { type RemoteResult, Result, NotAsked } from '~/@/core'
import { p } from '~/@/core/parser'
import { FlowPack } from '../../../@/pack/pack'

//
//
//
//
//

export type ModelClient = {
  packCreateNewRequest: RemoteResult<string, null>
}

export const initClient: ModelClient = {
  packCreateNewRequest: NotAsked
}

export type ModelServer = Record<string, unknown>

//
//
//
//

export type MsgClient = {
  t: 'create-new-pack.clicked-create-button'
}

export type MsgToServer = { t: 'create-new-pack.clicked-create-button' }

export type MsgServer = {
  t: 'noop'
}

export type MsgToClient = {
  t: 'create-new-pack.created-pack'
  created: Result<string, FlowPack>
}

//
//
//
//
//

export const MsgCore = p.obj({
  t: p.l('user-created-pack'),
  created: Result.parser(p.str, FlowPack),
  userId: UserId
})

export type MsgCore = p.Infer<typeof MsgCore>

export const ModelCore = p.obj({})
