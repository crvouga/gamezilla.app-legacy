import { s } from '~/@/schema'
import type { AppFrontendModule } from '~/app/@/architecture/app-frontend'
import { FlowFrontendCtxBase } from '../../frontend/ctx-base'
import { Puzzle } from '../puzzle'
import { PuzzleQuery } from '../puzzle-db/query'
import { PuzzleId } from '../puzzle-id'

export type ModelFrontend = {
  results: {
    [queryKey: string]: PuzzleId[]
  }
  queries: {
    [name: string]: PuzzleQuery
  }
}

export const initFrontend: ModelFrontend = {
  results: {},
  queries: {},
}

export type ModelBackend = null

export const MsgFrontend = s.obj({
  t: s.l('got-puzzle-db-puzzles'),
  query: PuzzleQuery,
  puzzles: s.arr(Puzzle),
})

export type MsgFrontend = s.Infer<typeof MsgFrontend>

export type FrontendModule = AppFrontendModule<{
  Model: ModelFrontend
  Msg: MsgFrontend
  Ctx: FlowFrontendCtxBase
  ViewSlot: { fab: null }
  ViewEmit: { clickedPuzzleItem: Puzzle }
}>
