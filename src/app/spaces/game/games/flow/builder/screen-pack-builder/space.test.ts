import { describe, expect, it } from 'bun:test'
import { Ok } from '~/@/result'
import { Pack } from '../../@/pack/pack'
import { PackPuzzleGridUI } from '../../@/pack/pack-puzzle-grid-ui'
import { Puzzle } from '../../@/puzzle/puzzle'
import { ScreenPackBuilderSpaceFixture } from './@/fixture/space'
import { ScreenPackBuilderSpace } from './space'

const Fixture = ScreenPackBuilderSpaceFixture

describe(import.meta.file, () => {
  it('should open pack builder after user creates a new pack', async () => {
    const f = await Fixture()
    const pack = await Pack.random()
    const modelSpace = f.updateModelSpace([
      {
        t: 'create-new-pack.user-created-pack',
        userId: f.currentUserId,
        created: Ok(pack),
      },
    ])

    expect(modelSpace.screenPackBuilder).toBeTruthy()
    expect(modelSpace.screen.t).toEqual('screen-pack-builder')
  })

  it('should remove puzzle from pack after clicking remove button', async () => {
    const f = await Fixture()

    const modelSpace = f.updateModelSpace([
      {
        t: 'remove-puzzle-from-pack.user-clicked-remove-from-pack-button',
        userId: f.currentUserId,
        puzzleIndex: 0,
      },
    ])

    expect(modelSpace.screenPackBuilder?.pack.puzzleIds.includes(f.puzzles[0].id)).toBe(false)
  })

  it('should be able to exit puzzle screen', async () => {
    const f = await Fixture()

    const modelSpace = f.updateModelSpace([
      {
        t: 'screen-pack-builder.puzzle-screen.user-clicked-exit-puzzle',
        userId: f.currentUserId,
      },
    ])

    expect(modelSpace.screenPackBuilder?.screen.t === 'screen-puzzle-grid').toBe(true)
  })

  it('should open puzzle screen when clicking puzzle grid item', async () => {
    const f = await Fixture()

    const modelSpace = f.updateModelSpace([
      {
        t: 'screen-pack-builder.user-clicked-pack-item',
        puzzleResult: { t: 'got', c: f.puzzles[0] },
        puzzleIndex: 0,
      },
    ])

    expect(
      modelSpace.screenPackBuilder?.screen.t === 'screen-puzzle' &&
        modelSpace.screenPackBuilder.screen.puzzleResult.t === 'got' &&
        modelSpace.screenPackBuilder.screen.puzzleResult.c.id === f.puzzles[0].id,
    ).toBe(true)
  })

  it("should be able to open 'more' drawer", async () => {
    const f = await Fixture()
    const modelSpace = f.updateModelSpace([
      {
        t: 'screen-pack-builder.user-clicked-pack-item',
        puzzleResult: { t: 'got', c: f.puzzles[0] },
        puzzleIndex: 0,
      },
      {
        t: 'screen-pack-builder.puzzle-screen.user-clicked-more-button',
        userId: f.currentUserId,
      },
    ])
    expect(
      modelSpace.screenPackBuilder?.screen.t === 'screen-puzzle' &&
        modelSpace.screenPackBuilder?.screen.opened === 'more',
    ).toBe(true)
  })

  it("should be able to close 'more' drawer", async () => {
    const f = await Fixture()
    const modelSpace = f.updateModelSpace([
      {
        t: 'screen-pack-builder.user-clicked-pack-item',
        puzzleResult: { t: 'got', c: f.puzzles[0] },
        puzzleIndex: 0,
      },
      {
        t: 'screen-pack-builder.puzzle-screen.user-closed-more-drawer',
        userId: f.currentUserId,
      },
    ])
    expect(
      modelSpace.screenPackBuilder?.screen.t === 'screen-puzzle' &&
        modelSpace.screenPackBuilder?.screen.opened === null,
    ).toBe(true)
  })

  it('should be able to go to next puzzle', async () => {
    const f = await Fixture()
    const modelSpace = f.updateModelSpace([
      {
        t: 'screen-pack-builder.user-clicked-pack-item',
        puzzleResult: { t: 'got', c: f.puzzles[0] },
        puzzleIndex: 0,
      },
      {
        t: 'screen-pack-builder.puzzle-screen.user-clicked-next-puzzle',
        userId: f.currentUserId,
        nextPuzzleResult: { t: 'got', c: f.puzzles[1] },
      },
    ])
    expect(
      modelSpace.screenPackBuilder?.screen.t === 'screen-puzzle' &&
        modelSpace.screenPackBuilder?.screen.puzzleResult.t === 'got' &&
        modelSpace.screenPackBuilder?.screen.puzzleResult.c.id === f.puzzles[1].id,
    ).toBe(true)
  })

  it('should do nothing if next puzzle is not in pack', async () => {
    const f = await Fixture()
    const modelSpace = f.updateModelSpace([
      {
        t: 'screen-pack-builder.user-clicked-pack-item',
        puzzleResult: { t: 'got', c: f.puzzles[0] },
        puzzleIndex: 0,
      },
      {
        t: 'screen-pack-builder.puzzle-screen.user-clicked-next-puzzle',
        userId: f.currentUserId,
        nextPuzzleResult: {
          t: 'got',
          c: await Puzzle.random({
            createdBy: f.currentUserId,
          }),
        },
      },
    ])

    expect(
      modelSpace.screenPackBuilder?.screen.t === 'screen-puzzle' &&
        modelSpace.screenPackBuilder?.screen.puzzleIndex === 0,
    ).toBe(true)
  })

  it('should be able to go to previous puzzle', async () => {
    const f = await Fixture()
    const modelSpace = f.updateModelSpace([
      {
        t: 'screen-pack-builder.user-clicked-pack-item',
        puzzleResult: { t: 'got', c: f.puzzles[1] },
        puzzleIndex: 1,
      },
      {
        t: 'screen-pack-builder.puzzle-screen.user-clicked-previous-puzzle-button',
        userId: f.currentUserId,
        previousPuzzleResult: { t: 'got', c: f.puzzles[0] },
      },
    ])
    expect(
      modelSpace.screenPackBuilder?.screen.t === 'screen-puzzle' &&
        modelSpace.screenPackBuilder?.screen.puzzleResult.t === 'got' &&
        modelSpace.screenPackBuilder?.screen.puzzleResult.c.id === f.puzzles[0].id,
    ).toBe(true)
  })

  it('should do nothing if previous puzzle is not in pack', async () => {
    const f = await Fixture()
    const modelSpace = f.updateModelSpace([
      {
        t: 'screen-pack-builder.user-clicked-pack-item',
        puzzleResult: { t: 'got', c: f.puzzles[1] },
        puzzleIndex: 1,
      },
      {
        t: 'screen-pack-builder.puzzle-screen.user-clicked-previous-puzzle-button',
        userId: f.currentUserId,
        previousPuzzleResult: {
          t: 'got',
          c: await Puzzle.random({
            createdBy: f.currentUserId,
          }),
        },
      },
    ])
    expect(
      modelSpace.screenPackBuilder?.screen.t === 'screen-puzzle' &&
        modelSpace.screenPackBuilder?.screen.puzzleResult.t === 'got' &&
        modelSpace.screenPackBuilder?.screen.puzzleResult.c.id === f.puzzles[1].id,
    ).toBe(true)
  })

  it('should be able to exit puzzle screen', async () => {
    const f = await Fixture()
    const modelSpace = f.updateModelSpace([
      {
        t: 'screen-pack-builder.user-clicked-pack-item',
        puzzleResult: { t: 'got', c: f.puzzles[1] },
        puzzleIndex: 1,
      },
      {
        t: 'screen-pack-builder.puzzle-screen.user-clicked-exit-puzzle',
        userId: f.currentUserId,
      },
    ])
    expect(modelSpace.screenPackBuilder?.screen.t === 'screen-puzzle-grid').toBe(true)
  })

  it('should be able to open add puzzle screen', async () => {
    const f = await Fixture()
    const modelSpace = f.updateModelSpace([
      {
        t: 'screen-pack-builder.user-clicked-open-add-puzzle-screen-button',
        userId: f.currentUserId,
      },
    ])
    expect(modelSpace.screenPackBuilder?.screen.t === 'screen-add-puzzle').toBe(true)
  })

  it('should be on the correct slide index after exiting the puzzle screen', async () => {
    const f = await Fixture({
      puzzleCount: PackPuzzleGridUI.PER_SLIDE_ITEM_COUNT + 1,
    })

    const puzzle = f.puzzles[f.puzzles.length - 1]

    if (!puzzle) throw new Error('Puzzle not found')

    const modelSpace = f.updateModelSpace([
      {
        t: 'screen-pack-builder.user-clicked-pack-item',
        puzzleResult: { t: 'got', c: puzzle },
        puzzleIndex: f.puzzles.length - 1,
      },
      {
        t: 'screen-pack-builder.puzzle-screen.user-clicked-exit-puzzle',
        userId: f.currentUserId,
      },
    ])

    const expected = PackPuzzleGridUI.toSlideIndex(modelSpace.screenPackBuilder?.pack.puzzleIds.indexOf(puzzle.id) ?? 0)
    const actual = ScreenPackBuilderSpace.toSlideIndex(modelSpace.screenPackBuilder)
    expect(actual).toBe(expected)
  })

  it('should allow user to change slide', async () => {
    const f = await Fixture({
      puzzleCount: PackPuzzleGridUI.PER_SLIDE_ITEM_COUNT + 1,
    })

    const modelSpace = f.updateModelSpace([
      {
        t: 'screen-pack-builder.user-changed-slide',
        newSlideIndex: 1,
        userId: f.currentUserId,
      },
    ])
    expect(ScreenPackBuilderSpace.toSlideIndex(f.modelSpace.screenPackBuilder)).toBe(0)
    expect(ScreenPackBuilderSpace.toSlideIndex(modelSpace.screenPackBuilder)).toBe(1)
  })

  it('should prevent slide index from going out of bounds', async () => {
    const f = await Fixture({
      puzzleCount: PackPuzzleGridUI.PER_SLIDE_ITEM_COUNT + 1,
    })
    const expectedSlide = PackPuzzleGridUI.toSlideIndex(PackPuzzleGridUI.PER_SLIDE_ITEM_COUNT + 1)
    const modelSpace = f.updateModelSpace([
      {
        t: 'screen-pack-builder.user-changed-slide',
        newSlideIndex: 100000,
        userId: f.currentUserId,
      },
    ])
    expect(ScreenPackBuilderSpace.toSlideIndex(modelSpace.screenPackBuilder)).toBe(expectedSlide)
  })

  it('should go back to grid after exiting puzzle', async () => {
    const f = await Fixture()
    const puzzle = f.puzzles[0]
    const output = f.updateModelSpace([
      {
        t: 'screen-pack-builder.user-clicked-pack-item',
        puzzleResult: { t: 'got', c: puzzle },
        puzzleIndex: 0,
      },
      {
        t: 'screen-pack-builder.puzzle-screen.user-clicked-exit-puzzle',
        userId: f.currentUserId,
      },
    ])
    expect(output.screenPackBuilder?.screen.t === 'screen-puzzle-grid').toBe(true)
  })

  it('should open the more drawer after clicking "more" button', async () => {
    const f = await Fixture()
    const puzzle = f.puzzles[0]
    const puzzleIndex = 0
    const output = f.updateModelSpace([
      {
        t: 'screen-pack-builder.user-clicked-pack-item',
        puzzleResult: { t: 'got', c: puzzle },
        puzzleIndex,
      },
      {
        t: 'screen-pack-builder.puzzle-screen.user-clicked-more-button',
        userId: f.currentUserId,
      },
    ])

    expect(
      output.screenPackBuilder?.screen.t === 'screen-puzzle' && output.screenPackBuilder?.screen.opened === 'more',
    ).toBe(true)
  })

  it('should close the more drawer', async () => {
    const f = await Fixture()
    const puzzle = f.puzzles[0]
    const puzzleIndex = 0
    const output = f.updateModelSpace([
      {
        t: 'screen-pack-builder.user-clicked-pack-item',
        puzzleResult: { t: 'got', c: puzzle },
        puzzleIndex,
      },
      {
        t: 'screen-pack-builder.puzzle-screen.user-clicked-more-button',
        userId: f.currentUserId,
      },
      {
        t: 'screen-pack-builder.puzzle-screen.user-closed-more-drawer',
        userId: f.currentUserId,
      },
    ])
    expect(
      output.screenPackBuilder?.screen.t === 'screen-puzzle' && output.screenPackBuilder?.screen.opened === null,
    ).toBe(true)
  })

  it('should should remove puzzle from pack clicking remove from pack button', async () => {
    const f = await Fixture()
    const puzzle = f.puzzles[0]
    const puzzleIndex = 0
    const output = f.updateModelSpace([
      {
        t: 'screen-pack-builder.user-clicked-pack-item',
        puzzleResult: { t: 'got', c: puzzle },
        puzzleIndex,
      },
      {
        t: 'screen-pack-builder.puzzle-screen.user-clicked-more-button',
        userId: f.currentUserId,
      },
      {
        t: 'remove-puzzle-from-pack.user-clicked-remove-from-pack-button',
        userId: f.currentUserId,
        puzzleIndex,
      },
    ])
    expect(output.screenPackBuilder?.screen.t === 'screen-puzzle-grid').toBe(true)
    expect(output.screenPackBuilder).toBeTruthy()
    expect(output.screenPackBuilder?.pack.puzzleIds.includes(puzzle.id)).toBe(false)
  })

  it('should open the correct level when opening puzzle screen', async () => {
    const f = await Fixture({
      puzzleCount: PackPuzzleGridUI.PER_SLIDE_ITEM_COUNT + 1,
    })
    const indexNextPage = PackPuzzleGridUI.PER_SLIDE_ITEM_COUNT + 1
    const modelSpace = f.updateModelSpace([
      {
        t: 'screen-pack-builder.user-clicked-pack-item',
        puzzleResult: { t: 'got', c: f.puzzles[indexNextPage]! },
        puzzleIndex: indexNextPage,
      },
    ])
    expect(
      modelSpace.screenPackBuilder?.screen.t === 'screen-puzzle' &&
        modelSpace.screenPackBuilder?.screen.puzzleIndex === indexNextPage,
    ).toBe(true)
  })

  it('should open the correct level when opening puzzle screen event when there is duplicate puzzles in the pack', async () => {
    const puzzle = await Puzzle.random()
    const f = await Fixture({
      appendDuplicatesOf: puzzle,
    })

    const modelSpace = f.updateModelSpace([
      {
        t: 'screen-pack-builder.user-clicked-pack-item',
        puzzleResult: { t: 'got', c: f.puzzles[f.puzzles.length - 1]! },
        puzzleIndex: f.puzzles.length - 1,
      },
    ])

    expect(
      modelSpace.screenPackBuilder?.screen.t === 'screen-puzzle' &&
        modelSpace.screenPackBuilder?.screen.puzzleIndex === f.puzzles.length - 1,
    ).toBe(true)
  })

  it('should not open pack item if puzzle is not at index given', async () => {
    const puzzle = await Puzzle.random()
    const f = await Fixture({
      appendDuplicatesOf: puzzle,
    })

    const puzzleLast = f.puzzles[f.puzzles.length - 1]

    if (!puzzleLast) throw new Error('Puzzle not found')

    const modelSpace = f.updateModelSpace([
      {
        t: 'screen-pack-builder.user-clicked-pack-item',
        puzzleResult: { t: 'got', c: puzzleLast },
        puzzleIndex: 0,
      },
    ])

    expect(modelSpace.screenPackBuilder?.screen.t === 'screen-puzzle-grid').toBe(true)
  })

  it('should open not-found puzzle', async () => {
    const f = await Fixture()
    const modelSpace = f.updateModelSpace([
      {
        t: 'screen-pack-builder.user-clicked-pack-item',
        puzzleResult: { t: 'not-found' },
        puzzleIndex: 0,
      },
    ])
    expect(modelSpace.screenPackBuilder?.screen.t === 'screen-puzzle').toBe(true)
  })
})
