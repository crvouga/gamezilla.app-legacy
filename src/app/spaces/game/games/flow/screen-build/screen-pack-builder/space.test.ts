import { beforeEach, describe, expect, it, test } from 'bun:test'
import { PackPuzzleGridUI } from '../../@/pack/pack-puzzle-grid-ui'
import { Puzzle } from '../../@/puzzle/puzzle'
import { ScreenPackBuildSpaceFixture } from './@/fixture/space'
import { ScreenPackBuildSpace } from './space'
import { assertNotNullish } from '~/@/assert'

const Fixture = ScreenPackBuildSpaceFixture

describe(import.meta.file, () => {
  let f: Awaited<ReturnType<typeof Fixture>>

  beforeEach(async () => {
    f = await Fixture()
  })

  describe.only('remove puzzle from pack', () => {
    it('should remove puzzle from pack after clicking remove button', async () => {
      const modelSpace = f.update(f.initial, [
        {
          t: 'remove-puzzle-from-pack.user-clicked-remove-from-pack-button',
          userId: f.createdBy,
          puzzleIndex: 0,
        },
      ])

      expect(modelSpace?.pack.puzzleIds.includes(assertNotNullish(f.puzzles[0]).id)).toBe(false)
    })

    it('should remove puzzle from pack and close more drawer', async () => {
      const puzzle = assertNotNullish(f.puzzles[0])
      const puzzleIndex = 0
      const output = f.update(f.initial, [
        {
          t: 'screen-pack-builder.user-clicked-pack-item',
          puzzleResult: { t: 'got', c: puzzle },
          puzzleIndex,
        },
        {
          t: 'screen-pack-builder.puzzle-screen.user-clicked-open-more-drawer-button',
          userId: f.createdBy,
        },
        {
          t: 'remove-puzzle-from-pack.user-clicked-remove-from-pack-button',
          userId: f.createdBy,
          puzzleIndex,
        },
      ])
      expect(output?.screen.t === 'screen-puzzle-grid').toBe(true)
      expect(output?.opened).toBe(null)
      expect(output?.pack.puzzleIds.includes(puzzle.id)).toBe(false)
    })
  })

  it('should be able to exit puzzle screen', async () => {
    const modelSpace = f.update(f.initial, [
      {
        t: 'screen-pack-builder.puzzle-screen.user-clicked-exit-play-puzzle-screen',
        userId: f.createdBy,
      },
    ])

    expect(modelSpace?.screen.t === 'screen-puzzle-grid').toBe(true)
  })

  it('should open puzzle screen when clicking puzzle grid item', async () => {
    const modelSpace = f.update(f.initial, [
      {
        t: 'screen-pack-builder.user-clicked-pack-item',
        puzzleResult: { t: 'got', c: assertNotNullish(f.puzzles[0]) },
        puzzleIndex: 0,
      },
    ])

    expect(
      modelSpace?.screen.t === 'screen-puzzle' &&
        modelSpace.screen.puzzleResult.t === 'got' &&
        modelSpace.screen.puzzleResult.c.id === assertNotNullish(f.puzzles[0]).id,
    ).toBe(true)
  })

  it("should be able to open 'more' drawer", async () => {
    const modelSpace = f.update(f.initial, [
      {
        t: 'screen-pack-builder.user-clicked-pack-item',
        puzzleResult: { t: 'got', c: assertNotNullish(f.puzzles[0]) },
        puzzleIndex: 0,
      },
      {
        t: 'screen-pack-builder.puzzle-screen.user-clicked-open-more-drawer-button',
        userId: f.createdBy,
      },
    ])
    expect(modelSpace?.screen.t === 'screen-puzzle' && modelSpace?.opened === 'more').toBe(true)
  })

  it("should be able to close 'more' drawer", async () => {
    const modelSpace = f.update(f.initial, [
      {
        t: 'screen-pack-builder.user-clicked-pack-item',
        puzzleResult: { t: 'got', c: assertNotNullish(f.puzzles[0]) },
        puzzleIndex: 0,
      },
      {
        t: 'screen-pack-builder.puzzle-screen.user-closed-more-drawer',
        userId: f.createdBy,
      },
    ])
    expect(modelSpace?.screen.t === 'screen-puzzle' && modelSpace?.opened === null).toBe(true)
  })

  it('should be able to go to next puzzle', async () => {
    const modelSpace = f.update(f.initial, [
      {
        t: 'screen-pack-builder.user-clicked-pack-item',
        puzzleResult: { t: 'got', c: assertNotNullish(f.puzzles[0]) },
        puzzleIndex: 0,
      },
      {
        t: 'screen-pack-builder.puzzle-screen.user-clicked-next-puzzle',
        userId: f.createdBy,
        nextPuzzleResult: { t: 'got', c: assertNotNullish(f.puzzles[1]) },
      },
    ])
    expect(
      modelSpace?.screen.t === 'screen-puzzle' &&
        modelSpace?.screen.puzzleResult.t === 'got' &&
        modelSpace?.screen.puzzleResult.c.id === assertNotNullish(f.puzzles[1]).id,
    ).toBe(true)
  })

  it('should do nothing if next puzzle is not in pack', async () => {
    const modelSpace = f.update(f.initial, [
      {
        t: 'screen-pack-builder.user-clicked-pack-item',
        puzzleResult: { t: 'got', c: assertNotNullish(f.puzzles[0]) },
        puzzleIndex: 0,
      },
      {
        t: 'screen-pack-builder.puzzle-screen.user-clicked-next-puzzle',
        userId: f.createdBy,
        nextPuzzleResult: {
          t: 'got',
          c: await Puzzle.random({
            createdBy: f.createdBy,
          }),
        },
      },
    ])

    expect(modelSpace?.screen.t === 'screen-puzzle' && modelSpace?.screen.puzzleIndex === 0).toBe(true)
  })

  it('should be able to go to previous puzzle', async () => {
    const modelSpace = f.update(f.initial, [
      {
        t: 'screen-pack-builder.user-clicked-pack-item',
        puzzleResult: { t: 'got', c: assertNotNullish(f.puzzles[1]) },
        puzzleIndex: 1,
      },
      {
        t: 'screen-pack-builder.puzzle-screen.user-clicked-previous-puzzle-button',
        userId: f.createdBy,
        previousPuzzleResult: { t: 'got', c: assertNotNullish(f.puzzles[0]) },
      },
    ])
    expect(
      modelSpace?.screen.t === 'screen-puzzle' &&
        modelSpace?.screen.puzzleResult.t === 'got' &&
        modelSpace?.screen.puzzleResult.c.id === assertNotNullish(f.puzzles[0]).id,
    ).toBe(true)
  })

  it('should do nothing if previous puzzle is not in pack', async () => {
    const modelSpace = f.update(f.initial, [
      {
        t: 'screen-pack-builder.user-clicked-pack-item',
        puzzleResult: { t: 'got', c: assertNotNullish(f.puzzles[1]) },
        puzzleIndex: 1,
      },
      {
        t: 'screen-pack-builder.puzzle-screen.user-clicked-previous-puzzle-button',
        userId: f.createdBy,
        previousPuzzleResult: {
          t: 'got',
          c: await Puzzle.random({
            createdBy: f.createdBy,
          }),
        },
      },
    ])
    expect(
      modelSpace?.screen.t === 'screen-puzzle' &&
        modelSpace?.screen.puzzleResult.t === 'got' &&
        modelSpace?.screen.puzzleResult.c.id === assertNotNullish(f.puzzles[1]).id,
    ).toBe(true)
  })

  it('should be able to exit puzzle screen', async () => {
    const modelSpace = f.update(f.initial, [
      {
        t: 'screen-pack-builder.user-clicked-pack-item',
        puzzleResult: { t: 'got', c: assertNotNullish(f.puzzles[1]) },
        puzzleIndex: 1,
      },
      {
        t: 'screen-pack-builder.puzzle-screen.user-clicked-exit-play-puzzle-screen',
        userId: f.createdBy,
      },
    ])
    expect(modelSpace?.screen.t === 'screen-puzzle-grid').toBe(true)
  })

  it('should be able to open add puzzle screen', async () => {
    const modelSpace = f.update(f.initial, [
      {
        t: 'screen-puzzle-grid.user-clicked-open-add-puzzle-screen-button',
        userId: f.createdBy,
      },
    ])
    expect(modelSpace?.screen.t === 'screen-add-puzzle').toBe(true)
  })

  it('should be on the correct slide index after exiting the puzzle screen', async () => {
    f = await Fixture({
      puzzleCount: PackPuzzleGridUI.PER_SLIDE_ITEM_COUNT + 1,
    })

    const puzzle = assertNotNullish(f.puzzles[f.puzzles.length - 1])

    const modelSpace = f.update(f.initial, [
      {
        t: 'screen-pack-builder.user-clicked-pack-item',
        puzzleResult: { t: 'got', c: puzzle },
        puzzleIndex: f.puzzles.length - 1,
      },
      {
        t: 'screen-pack-builder.puzzle-screen.user-clicked-exit-play-puzzle-screen',
        userId: f.createdBy,
      },
    ])

    const expected = PackPuzzleGridUI.toSlideIndex(modelSpace?.pack.puzzleIds.indexOf(puzzle.id) ?? 0)
    const actual = ScreenPackBuildSpace.toSlideIndex(modelSpace)
    expect(actual).toBe(expected)
  })

  it('should allow user to change slide', async () => {
    f = await Fixture({
      puzzleCount: PackPuzzleGridUI.PER_SLIDE_ITEM_COUNT + 1,
    })

    const modelSpace = f.update(f.initial, [
      {
        t: 'screen-pack-builder.user-changed-slide',
        newSlideIndex: 1,
        userId: f.createdBy,
      },
    ])
    expect(ScreenPackBuildSpace.toSlideIndex(f.initial)).toBe(0)
    expect(ScreenPackBuildSpace.toSlideIndex(modelSpace)).toBe(1)
  })

  it('should prevent slide index from going out of bounds', async () => {
    f = await Fixture({
      puzzleCount: PackPuzzleGridUI.PER_SLIDE_ITEM_COUNT + 1,
    })
    const expectedSlide = PackPuzzleGridUI.toSlideIndex(PackPuzzleGridUI.PER_SLIDE_ITEM_COUNT + 1)
    const modelSpace = f.update(f.initial, [
      {
        t: 'screen-pack-builder.user-changed-slide',
        newSlideIndex: 100000,
        userId: f.createdBy,
      },
    ])
    expect(ScreenPackBuildSpace.toSlideIndex(modelSpace)).toBe(expectedSlide)
  })

  it('should go back to grid after exiting puzzle', async () => {
    const puzzle = assertNotNullish(f.puzzles[0])
    const output = f.update(f.initial, [
      {
        t: 'screen-pack-builder.user-clicked-pack-item',
        puzzleResult: { t: 'got', c: puzzle },
        puzzleIndex: 0,
      },
      {
        t: 'screen-pack-builder.puzzle-screen.user-clicked-exit-play-puzzle-screen',
        userId: f.createdBy,
      },
    ])
    expect(output?.screen.t === 'screen-puzzle-grid').toBe(true)
  })

  it('should open the more drawer after clicking "more" button', async () => {
    const puzzle = assertNotNullish(f.puzzles[0])
    const puzzleIndex = 0
    const output = f.update(f.initial, [
      {
        t: 'screen-pack-builder.user-clicked-pack-item',
        puzzleResult: { t: 'got', c: puzzle },
        puzzleIndex,
      },
      {
        t: 'screen-pack-builder.puzzle-screen.user-clicked-open-more-drawer-button',
        userId: f.createdBy,
      },
    ])

    expect(output?.screen.t === 'screen-puzzle' && output?.opened === 'more').toBe(true)
  })

  it('should close the more drawer', async () => {
    const puzzle = assertNotNullish(f.puzzles[0])
    const puzzleIndex = 0
    const output = f.update(f.initial, [
      {
        t: 'screen-pack-builder.user-clicked-pack-item',
        puzzleResult: { t: 'got', c: puzzle },
        puzzleIndex,
      },
      {
        t: 'screen-pack-builder.puzzle-screen.user-clicked-open-more-drawer-button',
        userId: f.createdBy,
      },
      {
        t: 'screen-pack-builder.puzzle-screen.user-closed-more-drawer',
        userId: f.createdBy,
      },
    ])
    expect(output?.screen.t === 'screen-puzzle' && output?.opened === null).toBe(true)
  })

  it('should open the correct level when opening puzzle screen', async () => {
    f = await Fixture({
      puzzleCount: PackPuzzleGridUI.PER_SLIDE_ITEM_COUNT + 1,
    })
    const firstPuzzleIndexNextSlide = PackPuzzleGridUI.PER_SLIDE_ITEM_COUNT

    const modelSpace = f.update(f.initial, [
      {
        t: 'screen-pack-builder.user-clicked-pack-item',
        puzzleResult: { t: 'got', c: assertNotNullish(f.puzzles[firstPuzzleIndexNextSlide]) },
        puzzleIndex: firstPuzzleIndexNextSlide,
      },
    ])
    expect(
      modelSpace?.screen.t === 'screen-puzzle' && modelSpace?.screen.puzzleIndex === firstPuzzleIndexNextSlide,
    ).toBe(true)
  })

  it('should open the correct level when opening puzzle screen event when there is duplicate puzzles in the pack', async () => {
    const puzzle = await Puzzle.random()
    f = await Fixture({
      appendDuplicatesOf: puzzle,
    })

    const modelSpace = f.update(f.initial, [
      {
        t: 'screen-pack-builder.user-clicked-pack-item',
        puzzleResult: { t: 'got', c: assertNotNullish(f.puzzles[f.puzzles.length - 1]) },
        puzzleIndex: f.puzzles.length - 1,
      },
    ])

    expect(modelSpace?.screen.t === 'screen-puzzle' && modelSpace?.screen.puzzleIndex === f.puzzles.length - 1).toBe(
      true,
    )
  })

  it('should not open pack item if puzzle is not at index given', async () => {
    const puzzle = await Puzzle.random()
    f = await Fixture({
      appendDuplicatesOf: puzzle,
    })

    const puzzleLast = assertNotNullish(f.puzzles[f.puzzles.length - 1])

    const modelSpace = f.update(f.initial, [
      {
        t: 'screen-pack-builder.user-clicked-pack-item',
        puzzleResult: { t: 'got', c: puzzleLast },
        puzzleIndex: 0,
      },
    ])

    expect(modelSpace?.screen.t === 'screen-puzzle-grid').toBe(true)
  })

  it('should open not-found puzzle', async () => {
    const modelSpace = f.update(f.initial, [
      {
        t: 'screen-pack-builder.user-clicked-pack-item',
        puzzleResult: { t: 'not-found' },
        puzzleIndex: 0,
      },
    ])
    expect(modelSpace?.screen.t === 'screen-puzzle').toBe(true)
  })

  test('exit pack builder', async () => {
    const modelSpace = f.update(f.initial, [
      {
        t: 'screen-pack-builder.user-clicked-back-button',
        userId: f.createdBy,
      },
    ])
    expect(modelSpace.msgs?.length).toBe(1)
    expect(modelSpace.msgs?.some((m) => m.t === 'exit-pack-builder')).toBe(true)
  })

  describe('slide index clamping', () => {
    test('should clamp large slide index to 0', async () => {
      const modelSpace = f.update(f.initial, [
        {
          t: 'screen-pack-builder.user-changed-slide',
          userId: f.createdBy,
          newSlideIndex: 100000,
        },
      ])
      expect(ScreenPackBuildSpace.toSlideIndex(modelSpace)).toBe(0)
    })

    test('should account for add puzzle cell when clamping', async () => {
      f = await Fixture({ puzzleCount: PackPuzzleGridUI.PER_SLIDE_ITEM_COUNT })
      const modelSpace = f.update(f.initial, [
        {
          t: 'screen-pack-builder.user-changed-slide',
          userId: f.createdBy,
          newSlideIndex: 1,
        },
      ])
      expect(ScreenPackBuildSpace.toSlideIndex(modelSpace)).toBe(1)
    })
  })
})
