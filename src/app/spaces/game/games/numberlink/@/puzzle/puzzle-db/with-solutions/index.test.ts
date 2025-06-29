import { describe, expect, test } from '~/@/test-runner'
import { Logger } from '~/@/logger'
import { Result } from '~/@/result'
import { WithSolutions } from '.'
import { VariantGridShorthand } from '../../../variant/grid'
import { Puzzle } from '../../puzzle'
import { BaseFixtures } from '../fixture'

const Fixtures = async function* () {
  for await (const f of await BaseFixtures()) {
    const puzzleWithEmptySolutions = await Puzzle.random({
      numberlink: VariantGridShorthand.toGrid([
        ['A', ' '],
        [' ', 'A'],
      ]),
    })
    puzzleWithEmptySolutions.solutions = []

    yield {
      ...f,
      puzzleWithEmptySolutions,
      withSolutions: WithSolutions({ puzzleDb: f.puzzleDb, logger: Logger({ t: 'noop' }) }),
    }
  }
}

describe('WithSolutions', () => {
  test.todo('should assoc solutions before put', async () => {
    for await (const f of await Fixtures()) {
      const before = Result.unwrap(await f.puzzleDb.get(f.puzzleWithEmptySolutions.id))
      await f.withSolutions.put(f.puzzleWithEmptySolutions)
      const after = Result.unwrap(await f.puzzleDb.get(f.puzzleWithEmptySolutions.id))
      expect((before?.solutions.length ?? 0) === 0).toEqual(true)
      expect((after?.solutions.length ?? 0) > 0).toEqual(true)
    }
  })

  test.todo('should assoc solutions before get', async () => {
    for await (const f of await Fixtures()) {
      const before = Result.unwrap(await f.withSolutions.get(f.puzzleWithEmptySolutions.id))
      await f.puzzleDb.put(f.puzzleWithEmptySolutions)
      const after = Result.unwrap(await f.withSolutions.get(f.puzzleWithEmptySolutions.id))
      expect((before?.solutions.length ?? 0) === 0).toEqual(true)
      expect((after?.solutions.length ?? 0) > 0).toEqual(true)
    }
  })

  test.todo('should assoc solutions before list', async () => {
    for await (const f of await Fixtures()) {
      const before = Result.unwrap(
        await f.puzzleDb.query({
          where: {
            puzzleId: {
              in: [f.puzzleWithEmptySolutions.id],
            },
          },
          order: {
            createdAt: 'asc',
          },
          pagination: {
            limit: 10,
            offset: 0,
          },
        }),
      )
      await f.puzzleDb.put(f.puzzleWithEmptySolutions)
      const after = Result.unwrap(
        await f.withSolutions.query({
          where: {
            puzzleId: {
              in: [f.puzzleWithEmptySolutions.id],
            },
          },
          order: {
            createdAt: 'asc',
          },
          pagination: {
            limit: 10,
            offset: 0,
          },
        }),
      )
      expect(before?.puzzles.items.length === 0).toEqual(true)
      expect(after?.puzzles.items.length === 1).toEqual(true)
      for (const item of after?.puzzles.items ?? []) {
        expect(item?.solutions.length > 0).toEqual(true)
      }
    }
  })
})
