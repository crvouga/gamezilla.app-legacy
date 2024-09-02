import { FixtureSpaceClient } from 'gamezilla-app/app/spaces/@/testing/client'
import type { FlowClientCtx } from './flow-client-ctx'
import { FlowPuzzleList } from './flow-puzzle'

export const FlowClientFixture = async () => {
  const f = await FixtureSpaceClient()
  const ctx: FlowClientCtx = {
    ...f.ctx,
    flowPacks: {},
    flowPuzzles: {},
    flowPuzzleList: FlowPuzzleList.initClient
  }
  return {
    ...f,
    ctx
  }
}
