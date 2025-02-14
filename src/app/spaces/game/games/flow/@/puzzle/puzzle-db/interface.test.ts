import { describe, expect, it, test } from 'bun:test'
import { ascend } from '~/@/array/sorting'
import { Ok, Result } from '~/@/result'
import { Posix } from '~/@/time/posix'
import { TimeSpan } from '~/@/time/time-span'
import { UserId } from '~/app/@/data/user-id'
import { Puzzle } from '../puzzle'
import { PuzzleName } from '../puzzle-name'
import { BaseFixtures } from './fixture'

const Fixtures = async () => {
  return await BaseFixtures()
}

describe(import.meta.file, () => {
  it('should be able to insert', async () => {
    for await (const f of await Fixtures()) {
      const puzzle = await Puzzle.random()
      const inserted = await f.puzzleDb.put(puzzle)
      expect(inserted.t).toBe('ok')
    }
  })

  it('should be ok', async () => {
    for await (const f of await Fixtures()) {
      const puzzle = await Puzzle.random()
      const before = await f.puzzleDb.get(puzzle.id)
      const inserted = await f.puzzleDb.put(puzzle)
      const after = await f.puzzleDb.get(puzzle.id)

      expect(before.t).toBe('ok')
      expect(inserted.t).toBe('ok')
      expect(after.t).toBe('ok')
    }
  })

  it('should be able to insert puzzles', async () => {
    for await (const f of await Fixtures()) {
      const puzzle = await Puzzle.random()
      const before = await f.puzzleDb.get(puzzle.id)
      await f.puzzleDb.put(puzzle)
      const after = await f.puzzleDb.get(puzzle.id)

      expect(before).toEqual(Ok(null))
      expect(after).toEqual(Ok(puzzle))
    }
  })

  it('should be able to list puzzles by created by', async () => {
    for await (const f of await Fixtures()) {
      const puzzle = await Puzzle.random()
      await f.puzzleDb.put(puzzle)

      for (let i = 0; i < 3; i++) {
        await f.puzzleDb.put(await Puzzle.random())
      }

      const listed = await f.puzzleDb.query({
        order: {
          createdAt: 'asc',
        },
        pagination: {
          limit: 10,
          offset: 0,
        },
        where: {
          createdBy: {
            equals: puzzle.createdBy,
          },
        },
      })

      expect(listed.t).toBe('ok')
      if (listed.t === 'ok') {
        expect(listed.value.puzzles.items).toEqual([puzzle])
      }
    }
  })

  it('should be able to list puzzles by id', async () => {
    for await (const f of await Fixtures()) {
      const puzzleA = await Puzzle.random()
      await f.puzzleDb.put(puzzleA)
      const puzzleB = await Puzzle.random()
      await f.puzzleDb.put(puzzleB)

      for (let i = 0; i < 1; i++) {
        await f.puzzleDb.put(await Puzzle.random())
      }

      const listed = await f.puzzleDb.query({
        order: {
          createdAt: 'asc',
        },
        pagination: {
          limit: 10,
          offset: 0,
        },
        where: {
          puzzleId: {
            in: [puzzleA.id, puzzleB.id],
          },
        },
      })

      expect(listed.t).toBe('ok')
      if (listed.t === 'ok') {
        expect(listed.value.puzzles.items).toEqual([puzzleA, puzzleB])
      }
    }
  })

  it('should be able to count puzzles by created by user id', async () => {
    const EXPECTED_COUNT = 1

    for await (const f of await Fixtures()) {
      const createdBy = UserId.generate()
      for (let i = 0; i < EXPECTED_COUNT; i++) {
        await f.puzzleDb.put(
          await Puzzle.random({
            createdBy,
          }),
        )
      }
      for (let i = 0; i < 1; i++) {
        await f.puzzleDb.put(await Puzzle.random())
      }

      const counted = await f.puzzleDb.count({
        where: {
          createdBy: {
            equals: createdBy,
          },
        },
      })
      expect(Result.unwrap(counted)).toBe(EXPECTED_COUNT)
    }
  })

  it('should paginate correctly', async () => {
    for await (const f of await Fixtures()) {
      const puzzles: Puzzle[] = []
      const createdBy = UserId.generate()
      let createdAt = Posix.now()
      for (let i = 0; i < 5; i++) {
        const puzzle = await Puzzle.random({
          createdBy,
          createdAt,
        })
        createdAt = Posix.future(createdAt, TimeSpan.seconds(1))
        puzzles.push(puzzle)
        Result.unwrap(await f.puzzleDb.put(puzzle))
      }
      puzzles.sort(ascend((p) => p.createdAt))
      for (let limit = 0; limit < puzzles.length; limit++) {
        for (let offset = 0; offset < puzzles.length; offset++) {
          const listed = await f.puzzleDb.query({
            order: {
              createdAt: 'asc',
            },
            pagination: {
              limit,
              offset,
            },
            where: {
              createdBy: {
                equals: createdBy,
              },
            },
          })
          expect(listed.t).toBe('ok')
          if (listed.t === 'ok') {
            const expected = puzzles.slice(offset, offset + limit)
            expect(listed.value.puzzles.items).toEqual(expected)
          }
        }
      }
    }
  })

  it('should update existing record when upserting', async () => {
    for await (const f of await Fixtures()) {
      const puzzle = await Puzzle.random()
      await f.puzzleDb.put(puzzle)
      const updatedPuzzle = {
        ...puzzle,
        name: await PuzzleName.generate({
          count: 1,
        }),
      }
      await f.puzzleDb.put(updatedPuzzle)
      const after = Result.unwrapOr(await f.puzzleDb.get(puzzle.id), null)
      expect(after).toEqual(updatedPuzzle)
    }
  })

  it('should be able to zap records', async () => {
    for await (const f of await Fixtures()) {
      const puzzle = await Puzzle.random()
      await f.puzzleDb.put(puzzle)
      const before = Result.unwrapOr(await f.puzzleDb.get(puzzle.id), null)
      await f.puzzleDb.zap({
        puzzleId: puzzle.id,
        deletedByUserId: UserId.generate(),
      })
      const after = Result.unwrapOr(await f.puzzleDb.get(puzzle.id), null)
      expect(before).toEqual(puzzle)
      expect(after).toBe(null)
    }
  })

  test('list by id with empty id list', async () => {
    for await (const f of await Fixtures()) {
      const listed = await f.puzzleDb.query({
        where: {
          puzzleId: {
            in: [],
          },
        },
        order: {
          createdAt: 'asc',
        },
        pagination: {
          limit: 10,
          offset: 0,
        },
      })

      expect(listed).toEqual(
        Ok({
          solutions: {},
          puzzles: { items: [], limit: 10, offset: 0, total: 0 },
        }),
      )
    }
  })
})
