import { NotAsked, type RemoteResult, Result } from '~/@/core'
import { p } from '~/@/parser'
import { Posix } from '~/@/time/posix'
import { UserId } from '~/app/@/data'
import { Puzzle } from '../../../@/puzzle/puzzle'

//
//
//
//
//

export type ModelClient = {
  puzzleCreateRequest: RemoteResult<string, null>
  puzzleCreateRequestedAt: Posix
}

export const initClient: ModelClient = {
  puzzleCreateRequest: NotAsked,
  puzzleCreateRequestedAt: Posix.now()
}

export type ModelServer = {}

//
//
//
//

export type MsgClient = {
  t: 'create-new-puzzle.user-clicked-create-button'
}

export type MsgServer = { t: 'noop' }

export type MsgToServer = { t: 'create-new-puzzle.user-clicked-create-button' }

export type MsgToClient = {
  t: 'created-puzzle'
  created: Result<string, Puzzle>
}

//
//
//
//
//

export const MsgCore = p.obj({
  t: p.l('create-new-puzzle.user-created-puzzle'),
  created: Result.parser(p.str, Puzzle),
  userId: UserId
})
export type MsgCore = p.Infer<typeof MsgCore>
