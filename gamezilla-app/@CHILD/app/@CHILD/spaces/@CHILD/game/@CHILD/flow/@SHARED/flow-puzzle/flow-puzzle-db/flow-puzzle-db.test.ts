import { describe, expect, it } from "bun:test"
import { FlowPuzzleDb } from "./flow-puzzle-db-impl"
import { FlowPuzzle } from "../flow-puzzle"
import { Posix, Result } from "gamezilla-app/@SHARED/core"
import { UserId } from "gamezilla-app/@CHILD/app/@SHARED/data"
import { FlowVariant, FlowVariantDimensions } from "../../flow/flow-variant"
import { FlowPuzzleName } from "../flow-puzzle-name"
import { FlowPuzzleId } from "../flow-puzzle-id"

const randomFlowPuzzle = (input?: { createdBy?: UserId }): FlowPuzzle => {
  const createdBy = input?.createdBy ?? UserId.generate()
  return {
    createdAt: Posix.now(),
    createdBy,
    name: FlowPuzzleName.generate({
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

const Fixture = () => {
  const flowPuzzleDb = FlowPuzzleDb({
    t: "hash-map",
  })

  return {
    flowPuzzleDb,
  }
}

describe(import.meta.file, () => {
  it("should be ok", async () => {
    const f = Fixture()

    const puzzle = randomFlowPuzzle()
    const before = await f.flowPuzzleDb.get(puzzle.id)
    const inserted = await f.flowPuzzleDb.upsert(puzzle)
    const after = await f.flowPuzzleDb.get(puzzle.id)

    expect(before.t).toBe("ok")
    expect(inserted.t).toBe("ok")
    expect(after.t).toBe("ok")
  })

  it("should be able to insert puzzles", async () => {
    const f = Fixture()

    const puzzle = randomFlowPuzzle()
    const before = Result.withDefault(await f.flowPuzzleDb.get(puzzle.id), null)
    await f.flowPuzzleDb.upsert(puzzle)
    const after = Result.withDefault(await f.flowPuzzleDb.get(puzzle.id), null)

    expect(before).toBe(null)
    expect(after).toBe(puzzle)
  })

  it("should be able to list puzzles by created by", async () => {
    const f = Fixture()

    const puzzle = randomFlowPuzzle()
    await f.flowPuzzleDb.upsert(puzzle)

    for (let i = 0; i < 3; i++) {
      await f.flowPuzzleDb.upsert(randomFlowPuzzle())
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
    const f = Fixture()

    const puzzleA = randomFlowPuzzle()
    await f.flowPuzzleDb.upsert(puzzleA)
    const puzzleB = randomFlowPuzzle()
    await f.flowPuzzleDb.upsert(puzzleB)

    for (let i = 0; i < 3; i++) {
      await f.flowPuzzleDb.upsert(randomFlowPuzzle())
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

    const f = Fixture()

    const createdBy = UserId.generate()
    for (let i = 0; i < EXPECTED_COUNT; i++) {
      await f.flowPuzzleDb.upsert(randomFlowPuzzle({ createdBy }))
    }
    for (let i = 0; i < 10; i++) {
      await f.flowPuzzleDb.upsert(randomFlowPuzzle())
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
})
