import { SpaceBackendCtx } from '~/app/spaces/@/backend/ctx'
import { IPackDb } from '../pack/pack-db'
import { IPuzzleDb } from '../puzzle/puzzle-db'

export type FlowBackendCtx = SpaceBackendCtx & {
  flowPuzzleDb: IPuzzleDb
  flowPackDb: IPackDb
}
