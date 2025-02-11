import { SpaceFrontendCtx } from '~/app/spaces/@/frontend/ctx'
import { Pack } from '../pack/pack'
import { PackId } from '../pack/pack-id'
import type { Puzzle } from '../puzzle/puzzle'
import { IPuzzleDb } from '../puzzle/puzzle-db'
import type { PuzzleId } from '../puzzle/puzzle-id'
import { Solutions } from '../solutions/solutions'
import { IPackDb } from '../pack/pack-db'

export type FlowFrontendCtxBase = SpaceFrontendCtx & {
  packs: {
    [id: PackId]: Pack
  }
  puzzles: {
    [id: PuzzleId]: Puzzle
  }
  solutions: Solutions
  puzzleDb: IPuzzleDb
  packDb: IPackDb
}
