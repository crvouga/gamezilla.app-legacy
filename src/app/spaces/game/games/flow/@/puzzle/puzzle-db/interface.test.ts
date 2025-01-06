import { describe, expect, it, test } from 'bun:test'
import { ascend } from '~/@/array/sorting'
import { Ok, Result } from '~/@/result'
import { Posix } from '~/@/time/posix'
import { TimeSpan } from '~/@/time/time-span'
import { UserId } from '~/app/@/data/user-id'
import { Puzzle } from '../puzzle'
import { PuzzleName } from '../puzzle-name'
import { PuzzleDbFixture } from './fixture'

const Fixture = async () => {
  const f = await PuzzleDbFixture()
  return {
    ...f,
  }
}

describe(import.meta.file, () => {
  it('should be able to insert', async () => {
    const f = await Fixture()
    const puzzle = await Puzzle.random()
    const inserted = await f.flowPuzzleDb.put(puzzle)
    expect(inserted.t).toBe('ok')
  })

  it('should be ok', async () => {
    const f = await Fixture()

    const puzzle = await Puzzle.random()
    const before = await f.flowPuzzleDb.get(puzzle.id)
    const inserted = await f.flowPuzzleDb.put(puzzle)
    const after = await f.flowPuzzleDb.get(puzzle.id)

    expect(before.t).toBe('ok')
    expect(inserted.t).toBe('ok')
    expect(after.t).toBe('ok')
  })

  it('should be able to insert puzzles', async () => {
    const f = await Fixture()

    const puzzle = await Puzzle.random()
    const before = await f.flowPuzzleDb.get(puzzle.id)
    await f.flowPuzzleDb.put(puzzle)
    const after = await f.flowPuzzleDb.get(puzzle.id)

    expect(before).toEqual(Ok(null))
    expect(after).toEqual(Ok(puzzle))
  })

  it('should be able to list puzzles by created by', async () => {
    const f = await Fixture()

    const puzzle = await Puzzle.random()
    await f.flowPuzzleDb.put(puzzle)

    for (let i = 0; i < 3; i++) {
      await f.flowPuzzleDb.put(await Puzzle.random())
    }

    const listed = await f.flowPuzzleDb.list({
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
      expect(listed.value.items).toEqual([puzzle])
    }
  })

  it('should be able to list puzzles by id', async () => {
    const f = await Fixture()

    const puzzleA = await Puzzle.random()
    await f.flowPuzzleDb.put(puzzleA)
    const puzzleB = await Puzzle.random()
    await f.flowPuzzleDb.put(puzzleB)

    for (let i = 0; i < 1; i++) {
      await f.flowPuzzleDb.put(await Puzzle.random())
    }

    const listed = await f.flowPuzzleDb.list({
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
      expect(listed.value.items).toEqual([puzzleA, puzzleB])
    }
  })

  it('should be able to count puzzles by created by user id', async () => {
    const EXPECTED_COUNT = 1

    const f = await Fixture()

    const createdBy = UserId.generate()
    for (let i = 0; i < EXPECTED_COUNT; i++) {
      await f.flowPuzzleDb.put(
        await Puzzle.random({
          createdBy,
        }),
      )
    }
    for (let i = 0; i < 1; i++) {
      await f.flowPuzzleDb.put(await Puzzle.random())
    }

    const counted = await f.flowPuzzleDb.count({
      where: {
        createdBy: {
          equals: createdBy,
        },
      },
    })
    expect(Result.unwrap(counted)).toBe(EXPECTED_COUNT)
  })

  it('should paginate correctly', async () => {
    const f = await Fixture()
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
      Result.unwrap(await f.flowPuzzleDb.put(puzzle))
    }
    puzzles.sort(ascend((p) => p.createdAt))
    for (let limit = 0; limit < puzzles.length; limit++) {
      for (let offset = 0; offset < puzzles.length; offset++) {
        const listed = await f.flowPuzzleDb.list({
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
          expect(listed.value.items).toEqual(expected)
        }
      }
    }
  })

  it('should update existing record when upserting', async () => {
    const f = await Fixture()
    const puzzle = await Puzzle.random()
    await f.flowPuzzleDb.put(puzzle)
    const updatedPuzzle = {
      ...puzzle,
      name: await PuzzleName.generate({
        count: 1,
      }),
    }
    await f.flowPuzzleDb.put(updatedPuzzle)
    const after = Result.unwrapOr(await f.flowPuzzleDb.get(puzzle.id), null)
    expect(after).toEqual(updatedPuzzle)
  })

  it('should be able to zap records', async () => {
    const f = await Fixture()
    const puzzle = await Puzzle.random()
    await f.flowPuzzleDb.put(puzzle)
    const before = Result.unwrapOr(await f.flowPuzzleDb.get(puzzle.id), null)
    await f.flowPuzzleDb.zap({
      id: puzzle.id,
      deletedByUserId: UserId.generate(),
    })
    const after = Result.unwrapOr(await f.flowPuzzleDb.get(puzzle.id), null)
    expect(before).toEqual(puzzle)
    expect(after).toBe(null)
  })

  test('list by id with empty id list', async () => {
    const f = await Fixture()

    const listed = await f.flowPuzzleDb.list({
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
        items: [],
        limit: 10,
        offset: 0,
        total: 0,
      }),
    )
  })
})
