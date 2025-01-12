import { SpaceBackendCtx } from '~/app/spaces/@/space-server/ctx'
import { IPackDb } from '../pack/pack-db'
import { IPuzzleDb } from '../puzzle/puzzle-db'
import { Solutions } from '../solutions/solutions'

export type FlowBackendCtx = SpaceBackendCtx & {
  puzzleDb: IPuzzleDb
  packDb: IPackDb
  solutions: Solutions
}
