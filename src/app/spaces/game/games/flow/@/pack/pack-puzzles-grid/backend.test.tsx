import { describe, expect, it } from 'bun:test'
import { AppBackendModule } from '~/app/@/architecture/app-backend'
import { didSendToClient } from '~/app/@/backend/cmd'
import { randomAuthenticatedClient, type AuthenticatedClient } from '~/app/spaces/@/fixture/backend'
import { SpaceGameFixtureBackend } from '~/app/spaces/game/games/@/testing/backend'
import { Puzzle } from '../../puzzle/puzzle'
import { PuzzleDb } from '../../puzzle/puzzle-db'
import type { PuzzleId } from '../../puzzle/puzzle-id'
import { FlowBackendCtx } from '../../backend/ctx'
import { Pack } from '../pack'
import { PackDb } from '../pack-db'
import { PackPuzzlesGridBackend } from './backend'
import { Solutions } from '../../solutions/solutions'

const initial = () => {
  return {}
}

const userObversedGrid = (ctx: FlowBackendCtx, client: AuthenticatedClient, puzzleIds: PuzzleId[]) => () => {
  return PackPuzzlesGridBackend.update({
    ctx,
    deps: null,
    msgClient: {
      ...client,
      puzzleIds,
      t: 'list-puzzles-by-id',
      causedBy: null,
    },
  })
}

const Fixture = async () => {
  const f = await SpaceGameFixtureBackend()
  const ctx: FlowBackendCtx = {
    ...f.ctx,
    packDb: PackDb({ t: 'hash-map' }),
    puzzleDb: PuzzleDb({ t: 'hash-map' }),
    solutions: Solutions.init,
  }
  const client = randomAuthenticatedClient()
  const puzzle = await Puzzle.random()
  const somePack = await Pack.create({
    createdBy: client.userId,
    now: f.ctx.now,
    puzzleIds: [puzzle.id],
  })

  await ctx.puzzleDb.put(puzzle)
  await ctx.packDb.put(somePack)

  return { ...f, client, ctx }
}

describe(import.meta.file, () => {
  it('should send back listed puzzles', async () => {
    const f = await Fixture()
    const output = await AppBackendModule.andThen(initial(), userObversedGrid(f.ctx, f.client, []))

    expect(didSendToClient(output, f.client.clientId, (msg) => msg.t === 'listed-puzzles-by-id')).toBe(true)
  })
})
