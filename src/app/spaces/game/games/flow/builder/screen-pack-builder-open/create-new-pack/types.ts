import { UserId } from '~/app/@/data/user-id'
import { type RemoteResult, Result, NotAsked } from '~/@/result'
import { p } from '~/@/parser'
import { Pack } from '../../../@/pack/pack'

//
//
//
//
//

export type ModelFrontend = {
  packCreateNewRequest: RemoteResult<string, null>
}

export const initFrontend: ModelFrontend = {
  packCreateNewRequest: NotAsked,
}

export type ModelBackend = Record<string, unknown>

//
//
//
//

export type MsgFrontend = {
  t: 'create-new-pack.clicked-create-button'
}

export type MsgToBackend = { t: 'create-new-pack.clicked-create-button' }

export type MsgBackend = {
  t: 'noop'
}

export type MsgToFrontend = {
  t: 'create-new-pack.created-pack'
  created: Result<string, Pack>
}

//
//
//
//
//

export const MsgSpace = p.obj({
  t: p.l('user-created-pack'),
  created: Result.parser(p.str, Pack),
  userId: UserId,
})

export type MsgSpace = p.Infer<typeof MsgSpace>

export const ModelSpace = p.obj({})
