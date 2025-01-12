import { NotAsked, type RemoteResult, Result } from '~/@/result'
import { p } from '~/@/parser'
import { Posix } from '~/@/time/posix'
import { UserId } from '~/app/@/data/user-id'
import { Puzzle } from '../../../@/puzzle/puzzle'

//
//
//
//
//

export type ModelFrontend = {
  puzzleCreateRequest: RemoteResult<string, null>
  puzzleCreateRequestedAt: Posix
}

export const initFrontend: ModelFrontend = {
  puzzleCreateRequest: NotAsked,
  puzzleCreateRequestedAt: Posix.now(),
}

export type ModelBackend = {}

//
//
//
//

export type MsgFrontend = {
  t: 'create-new-puzzle.user-clicked-create-button'
}

export type MsgBackend = { t: 'noop' }

export type MsgToBackend = { t: 'create-new-puzzle.user-clicked-create-button' }

export type MsgToFrontend = {
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
  userId: UserId,
})
export type MsgCore = p.Infer<typeof MsgCore>
