import { SpaceServerCtx } from '~/app/spaces/@/space-server-ctx'
import { IPackDb } from '../pack/pack-db'
import { IPuzzleDb } from '../puzzle/puzzle-db'

export type FlowServerCtx = SpaceServerCtx & {
  flowPuzzleDb: IPuzzleDb
  flowPackDb: IPackDb
}
