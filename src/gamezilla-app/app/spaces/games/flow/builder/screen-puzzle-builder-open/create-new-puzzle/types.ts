import { NotAsked, Posix, type RemoteResult, Result } from '@/core'
import { p } from '@/core/parser'
import { UserId } from 'gamezilla-app/app/@/data'
import { FlowPuzzle } from '../../../@/puzzle/puzzle'

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
  created: Result<string, FlowPuzzle>
}

//
//
//
//
//

export const MsgCore = p.obj({
  t: p.l('create-new-puzzle.user-created-puzzle'),
  created: Result.parser(p.str, FlowPuzzle),
  userId: UserId
})
export type MsgCore = p.Infer<typeof MsgCore>
