import { SpaceFrontendCtx } from '~/app/spaces/@/frontend/ctx'
import { IPackDb } from '../pack/pack-db'
import { IPuzzleDb } from '../puzzle/puzzle-db'
import { ISolutionsDb } from '../solutions/solutions-db/interface'

export type FlowFrontendCtxBase = SpaceFrontendCtx & {
  solutionsDb: ISolutionsDb
  puzzleDb: IPuzzleDb
  packDb: IPackDb
}
