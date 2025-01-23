import { p } from '~/@/parser'
import { NotAsked, type RemoteResult, Result } from '~/@/result'
import { UserId } from '~/app/@/data/user-id'
import { Puzzle } from '../../../@/puzzle/puzzle'

export type ModelFrontend = {
  puzzleCreateRequest: RemoteResult<string, unknown>
}

export const initFrontend: ModelFrontend = {
  puzzleCreateRequest: NotAsked,
}

export type ModelBackend = {}

export type MsgFrontend =
  | {
      t: 'create-new-puzzle.user-clicked-create-button'
    }
  | {
      t: 'create-new-puzzle.db-inserted-puzzle'
      result: Result<string, Puzzle>
    }

export type MsgBackend = { t: 'noop' }

export type MsgToBackend = { t: 'noop' }

export type MsgToFrontend = { t: 'noop' }

export const MsgSpace = p.obj({
  t: p.l('create-new-puzzle.user-created-puzzle'),
  created: Result.parser(p.str, Puzzle),
  userId: UserId,
})
export type MsgSpace = p.Infer<typeof MsgSpace>
