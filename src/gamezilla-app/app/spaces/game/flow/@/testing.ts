import { FixtureSpaceClient } from 'gamezilla-app/app/spaces/@/testing/client'
import type { FlowClientCtx } from './flow-client-ctx'
import { FlowPackListTypes } from './flow-pack'
import { FlowPuzzleListTypes } from './flow-puzzle'

export const FlowClientFixture = async () => {
  const f = await FixtureSpaceClient()
  const ctx: FlowClientCtx = {
    ...f.ctx,
    flowPacks: {},
    flowPuzzles: {},
    flowPuzzleList: FlowPuzzleListTypes.initClient,
    flowPackList: FlowPackListTypes.initClient
  }
  return {
    ...f,
    ctx
  }
}
