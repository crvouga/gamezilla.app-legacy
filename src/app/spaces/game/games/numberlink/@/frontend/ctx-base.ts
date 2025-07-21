import { SpaceFrontendCtx } from '~/app/spaces/@/frontend/ctx'
import { IPackDb } from '../pack/pack-db'
import { IPuzzleDb } from '../puzzle/puzzle-db'
import { Solutions } from '../solutions/solutions'
import { ISolutionsDb } from '../solutions/solutions-db/interface'

export type FlowFrontendCtxBase = SpaceFrontendCtx & {
  solutions: Solutions
  solutionsDb: ISolutionsDb
  puzzleDb: IPuzzleDb
  packDb: IPackDb
}
