import { describe, expect, it } from "bun:test"
import { FlowPuzzleDb } from "./flow-puzzle-db-impl"
import { FlowPuzzle } from "../flow-puzzle"
import { Posix, Result } from "gamezilla-app/@SHARED/core"
import { UserId } from "gamezilla-app/@CHILD/app/@SHARED/data"
import { FlowVariant, FlowVariantDimensions } from "../../flow/flow-variant"
import { FlowPuzzleName } from "../flow-puzzle-name"
import { FlowPuzzleId } from "../flow-puzzle-id"
import { DbConnSql } from "gamezilla-app/@CHILD/app/@SHARED/server/db-conn-sql"
import { loggerNoop } from "gamezilla-app/@CHILD/app/@SHARED/server/logger"

const randomFlowPuzzle = async (input?: {
  createdBy?: UserId
}): Promise<FlowPuzzle> => {
  const createdBy = input?.createdBy ?? UserId.generate()
  return {
    createdAt: Posix.now(),
    createdBy,
    name: await FlowPuzzleName.generate({
      count: 0,
    }),
    lastUpdatedAt: Posix.now(),
    lastUpdatedBy: createdBy,
    id: FlowPuzzleId.generate(),
    flow: FlowVariant.init({
      dimensions: FlowVariantDimensions.init({
        t: "flow-grid",
        height: 10,
        width: 10,
      }),
      terminalsByGroupId: {},
    }),
  }
}

const Fixture = async () => {
  const IS_INTEGRATION_TEST = process.env["IS_INTEGRATION_TEST"]

  if (IS_INTEGRATION_TEST) {
    const DATABASE_URL = process.env["DATABASE_URL"]

    if (!DATABASE_URL) {
      throw new Error(`DATABASE_URL not set`)
    }

    const dbConnSql = await DbConnSql({
      databaseUrl: DATABASE_URL,
      logger: loggerNoop,
    })

    const flowPuzzleDb = FlowPuzzleDb({
      t: "postgres",
      dbConn: dbConnSql,
    })

    return {
      flowPuzzleDb,
    }
  }

  const flowPuzzleDb = FlowPuzzleDb({
    t: "hash-map",
  })

  return {
    flowPuzzleDb,
  }
}

describe(import.meta.file, () => {
  it("should be ok", async () => {
    const f = await Fixture()

    const puzzle = await randomFlowPuzzle()
    const before = await f.flowPuzzleDb.get(puzzle.id)
    const inserted = await f.flowPuzzleDb.upsert(puzzle)
    const after = await f.flowPuzzleDb.get(puzzle.id)

    expect(before.t).toBe("ok")
    expect(inserted.t).toBe("ok")
    expect(after.t).toBe("ok")
  })

  it("should be able to insert puzzles", async () => {
    const f = await Fixture()

    const puzzle = await randomFlowPuzzle()
    const before = Result.withDefault(await f.flowPuzzleDb.get(puzzle.id), null)
    await f.flowPuzzleDb.upsert(puzzle)
    const after = Result.withDefault(await f.flowPuzzleDb.get(puzzle.id), null)

    expect(before).toBe(null)
    expect(after).toBe(puzzle)
  })

  it("should be able to list puzzles by created by", async () => {
    const f = await Fixture()

    const puzzle = await randomFlowPuzzle()
    await f.flowPuzzleDb.upsert(puzzle)

    for (let i = 0; i < 3; i++) {
      await f.flowPuzzleDb.upsert(await randomFlowPuzzle())
    }

    const listed = await f.flowPuzzleDb.list({
      order: {
        createdAt: "asc",
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

    expect(listed.t).toBe("ok")

    if (listed.t === "ok") {
      expect(listed.value.items).toEqual([puzzle])
    }
  })

  it("should be able to list puzzles by id", async () => {
    const f = await Fixture()

    const puzzleA = await randomFlowPuzzle()
    await f.flowPuzzleDb.upsert(puzzleA)
    const puzzleB = await randomFlowPuzzle()
    await f.flowPuzzleDb.upsert(puzzleB)

    for (let i = 0; i < 3; i++) {
      await f.flowPuzzleDb.upsert(await randomFlowPuzzle())
    }

    const listed = await f.flowPuzzleDb.list({
      order: {
        createdAt: "asc",
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

    expect(listed.t).toBe("ok")
    if (listed.t === "ok") {
      expect(listed.value.items).toEqual([puzzleA, puzzleB])
    }
  })

  it("should be able to count puzzles by created by user id", async () => {
    const EXPECTED_COUNT = 3

    const f = await Fixture()

    const createdBy = UserId.generate()
    for (let i = 0; i < EXPECTED_COUNT; i++) {
      await f.flowPuzzleDb.upsert(await randomFlowPuzzle({ createdBy }))
    }
    for (let i = 0; i < 3; i++) {
      await f.flowPuzzleDb.upsert(await randomFlowPuzzle())
    }

    const counted = await f.flowPuzzleDb.count({
      where: {
        createdBy: {
          equals: createdBy,
        },
      },
    })

    expect(counted.t).toBe("ok")
    if (counted.t === "ok") {
      expect(counted.value).toBe(EXPECTED_COUNT)
    }
  })

  it("should paginate correctly", async () => {
    const f = await Fixture()
    const puzzles: FlowPuzzle[] = []
    const createdBy = UserId.generate()
    for (let i = 0; i < 5; i++) {
      const puzzle = await randomFlowPuzzle({ createdBy })
      puzzles.push(puzzle)
      await f.flowPuzzleDb.upsert(puzzle)
    }
    for (let limit = 0; limit < puzzles.length; limit++) {
      for (let offset = 0; offset < puzzles.length; offset++) {
        const listed = await f.flowPuzzleDb.list({
          order: {
            createdAt: "asc",
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
        expect(listed.t).toBe("ok")
        if (listed.t === "ok") {
          const expected = puzzles.slice(offset, offset + limit)
          expect(listed.value.items).toEqual(expected)
        }
      }
    }
  })

  it("should update existing record when upserting", async () => {
    const f = await Fixture()
    const puzzle = await randomFlowPuzzle()
    await f.flowPuzzleDb.upsert(puzzle)
    const updatedPuzzle = {
      ...puzzle,
      name: await FlowPuzzleName.generate({
        count: 1,
      }),
    }
    await f.flowPuzzleDb.upsert(updatedPuzzle)
    const after = Result.withDefault(await f.flowPuzzleDb.get(puzzle.id), null)
    expect(after).toBe(updatedPuzzle)
  })

  it("should be able to zap records", async () => {
    const f = await Fixture()
    const puzzle = await randomFlowPuzzle()
    await f.flowPuzzleDb.upsert(puzzle)
    const before = Result.withDefault(await f.flowPuzzleDb.get(puzzle.id), null)
    await f.flowPuzzleDb.zap({
      id: puzzle.id,
      deletedByUserId: UserId.generate(),
    })
    const after = Result.withDefault(await f.flowPuzzleDb.get(puzzle.id), null)
    expect(before).toBe(puzzle)
    expect(after).toBe(null)
  })
})
