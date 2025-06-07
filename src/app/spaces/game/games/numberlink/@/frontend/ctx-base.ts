import { SpaceFrontendCtx } from '~/app/spaces/@/frontend/ctx'
import { Pack } from '../pack/pack'
import { IPackDb } from '../pack/pack-db'
import { PackId } from '../pack/pack-id'
import type { Puzzle } from '../puzzle/puzzle'
import { IPuzzleDb } from '../puzzle/puzzle-db'
import type { PuzzleId } from '../puzzle/puzzle-id'
import { Solutions } from '../solutions/solutions'
import { ISolutionsDb } from '../solutions/solutions-db/interface'

export type FlowFrontendCtxBase = SpaceFrontendCtx & {
  packs: {
    [id: PackId]: Pack
  }
  puzzles: {
    [id: PuzzleId]: Puzzle
  }
  solutions: Solutions
  solutionsDb: ISolutionsDb
  puzzleDb: IPuzzleDb
  packDb: IPackDb
}
