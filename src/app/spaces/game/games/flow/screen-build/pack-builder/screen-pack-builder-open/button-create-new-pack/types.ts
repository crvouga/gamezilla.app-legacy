import { s } from '~/@/schema'
import { NotAsked, type RemoteResult, Result } from '~/@/result'
import { UserId } from '~/app/@/data/user-id'
import { Pack } from '../../../../@/pack/pack'

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

export type MsgFrontend =
  | {
      t: 'create-new-pack.clicked-create-button'
    }
  | {
      t: 'create-new-pack.db-put-pack'
      created: Result<string, Pack>
      userId: UserId
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

export const MsgSpace = s.obj({
  t: s.l('create-new-pack.user-created-pack'),
  created: Result.schema(s.str(), Pack),
  userId: UserId,
})

export type MsgSpace = s.Infer<typeof MsgSpace>

export const ModelSpace = s.obj({})
