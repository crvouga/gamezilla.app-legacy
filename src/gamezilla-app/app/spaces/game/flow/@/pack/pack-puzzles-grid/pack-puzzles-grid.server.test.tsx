import { describe, expect, it } from 'bun:test'
import { AppServerModule } from 'gamezilla-app/app/@/architecture/app-server'
import { didSendToClient } from 'gamezilla-app/app/@/server'
import { randomAuthenticatedClient, type AuthenticatedClient } from 'gamezilla-app/app/spaces/@/fixture/server'
import { SpaceGameFixtureServer } from 'gamezilla-app/app/spaces/game/@/testing/server'
import { FlowPuzzle } from '../../puzzle/puzzle'
import { FlowPuzzleDb } from '../../puzzle/puzzle-db'
import type { FlowPuzzleId } from '../../puzzle/puzzle-id'
import { FlowServerCtx } from '../../flow-server-ctx'
import { FlowPack } from '../pack'
import { FlowPackDb } from '../pack-db'
import { FlowPackPuzzlesGridServer } from './pack-puzzles-grid.server'

const initial = () => {
  return {}
}

const userObversedGrid = (ctx: FlowServerCtx, client: AuthenticatedClient, puzzleIds: FlowPuzzleId[]) => () => {
  return FlowPackPuzzlesGridServer.update({
    ctx,
    deps: null,
    msgClient: {
      ...client,
      puzzleIds,
      t: 'list-puzzles-by-id',
      causedBy: null
    }
  })
}

const Fixture = async () => {
  const f = await SpaceGameFixtureServer()
  const ctx: FlowServerCtx = {
    ...f.ctx,
    flowPackDb: FlowPackDb({
      t: 'hash-map'
    }),
    flowPuzzleDb: FlowPuzzleDb({
      t: 'hash-map'
    })
  }
  const client = randomAuthenticatedClient()
  const puzzle = await FlowPuzzle.random()
  const somePack = await FlowPack.create({
    createdBy: client.userId,
    now: f.ctx.now,
    puzzleIds: [puzzle.id]
  })

  await ctx.flowPuzzleDb.put(puzzle)
  await ctx.flowPackDb.put(somePack)

  return { ...f, client, ctx }
}

describe(import.meta.file, () => {
  it('should send back listed puzzles', async () => {
    const f = await Fixture()
    const output = await AppServerModule.andThen(initial(), userObversedGrid(f.ctx, f.client, []))

    expect(didSendToClient(output, f.client.clientId, (msg) => msg.t === 'listed-puzzles-by-id')).toBe(true)
  })
})
