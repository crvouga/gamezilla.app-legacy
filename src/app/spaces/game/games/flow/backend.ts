import { Sub } from '~/@/sub'
import { SpaceBackendCtx } from '~/app/spaces/@/backend/ctx'
import { FlowBackendCtx } from './@/backend/ctx'
import { PackDb } from './@/pack/pack-db/impl'
import { PuzzleDb } from './@/puzzle/puzzle-db'
import { Solutions } from './@/solutions/solutions'
import type { BackendModule } from './types'

const initCtx = (input: { ctx: SpaceBackendCtx }): FlowBackendCtx => {
  return {
    ...input.ctx,
    puzzleDb: PuzzleDb({ t: 'db-conn-sql', dbConnSql: input.ctx.dbConnSql, logger: input.ctx.logger }),
    packDb: PackDb({ t: 'db-conn-sql', dbConnSql: input.ctx.dbConnSql, logger: input.ctx.logger }),
    solutions: Solutions.init,
  }
}

const init: BackendModule['init'] = {
  t: 'noop',
}

const update: BackendModule['update'] = async (_input) => {
  return {}
}

const subscriptions: BackendModule['subscriptions'] = async (_input) => {
  return Sub.None
}

export const FlowBackend = {
  init,
  subscriptions,
  update,
  initCtx,
}
