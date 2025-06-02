import { SpaceBackendCtx } from '~/app/spaces/@/backend/ctx'
import { FlowBackendCtx } from './@/backend/ctx'
import { PackDb } from './@/pack/pack-db'
import { PuzzleDb } from './@/puzzle/puzzle-db'

const initCtx = (input: { ctx: SpaceBackendCtx }): FlowBackendCtx => {
  return {
    ...input.ctx,
    flowPuzzleDb: PuzzleDb({ t: 'db-conn-sql', dbConnSql: input.ctx.dbConnSql, logger: input.ctx.logger }),
    flowPackDb: PackDb({ t: 'db-conn-sql', dbConnSql: input.ctx.dbConnSql, logger: input.ctx.logger }),
  }
}

const worker = async (_s: AbortSignal, _input: { ctx: FlowBackendCtx }) => {}

export const FlowBackend = {
  initCtx,
  worker,
}
