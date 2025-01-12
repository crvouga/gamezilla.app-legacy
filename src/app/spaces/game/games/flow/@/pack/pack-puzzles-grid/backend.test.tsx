import { describe, expect, it } from 'bun:test'
import { AppBackendModule } from '~/app/@/architecture/app-backend'
import { didSendToFrontend } from '~/app/@/backend/cmd'
import { randomAuthenticatedFrontend, type AuthenticatedFrontend } from '~/app/spaces/@/fixture/backend'
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

const userObversedGrid = (ctx: FlowBackendCtx, frontend: AuthenticatedFrontend, puzzleIds: PuzzleId[]) => () => {
  return PackPuzzlesGridBackend.update({
    ctx,
    deps: null,
    msgFrontend: {
      ...frontend,
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
  const frontend = randomAuthenticatedFrontend()
  const puzzle = await Puzzle.random()
  const somePack = await Pack.create({
    createdBy: frontend.userId,
    now: f.ctx.now,
    puzzleIds: [puzzle.id],
  })

  await ctx.puzzleDb.put(puzzle)
  await ctx.packDb.put(somePack)

  return { ...f, frontend, ctx }
}

describe(import.meta.file, () => {
  it('should send back listed puzzles', async () => {
    const f = await Fixture()
    const output = await AppBackendModule.andThen(initial(), userObversedGrid(f.ctx, f.frontend, []))

    expect(didSendToFrontend(output, f.frontend.clientId, (msg) => msg.t === 'listed-puzzles-by-id')).toBe(true)
  })
})
