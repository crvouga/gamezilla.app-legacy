import { describe, expect, it, test } from 'bun:test'
import { PackPuzzleGridUI } from '../../@/pack/pack-puzzle-grid-ui'
import { Puzzle } from '../../@/puzzle/puzzle'
import { ScreenPackBuilderSpaceFixture } from './@/fixture/space'
import { ScreenPackBuilderSpace } from './space'

const Fixture = ScreenPackBuilderSpaceFixture

describe(import.meta.file, () => {
  it('should remove puzzle from pack after clicking remove button', async () => {
    const f = await Fixture()

    const modelSpace = f.update(f.initial, [
      {
        t: 'remove-puzzle-from-pack.user-clicked-remove-from-pack-button',
        userId: f.createdBy,
        puzzleIndex: 0,
      },
    ])

    expect(modelSpace?.pack.puzzleIds.includes(f.puzzles[0].id)).toBe(false)
  })

  it('should be able to exit puzzle screen', async () => {
    const f = await Fixture()

    const modelSpace = f.update(f.initial, [
      {
        t: 'screen-pack-builder.puzzle-screen.user-clicked-exit-play-puzzle-screen',
        userId: f.createdBy,
      },
    ])

    expect(modelSpace?.screen.t === 'screen-puzzle-grid').toBe(true)
  })

  it('should open puzzle screen when clicking puzzle grid item', async () => {
    const f = await Fixture()

    const modelSpace = f.update(f.initial, [
      {
        t: 'screen-pack-builder.user-clicked-pack-item',
        puzzleResult: { t: 'got', c: f.puzzles[0] },
        puzzleIndex: 0,
      },
    ])

    expect(
      modelSpace?.screen.t === 'screen-puzzle' &&
        modelSpace.screen.puzzleResult.t === 'got' &&
        modelSpace.screen.puzzleResult.c.id === f.puzzles[0].id,
    ).toBe(true)
  })

  it("should be able to open 'more' drawer", async () => {
    const f = await Fixture()
    const modelSpace = f.update(f.initial, [
      {
        t: 'screen-pack-builder.user-clicked-pack-item',
        puzzleResult: { t: 'got', c: f.puzzles[0] },
        puzzleIndex: 0,
      },
      {
        t: 'screen-pack-builder.puzzle-screen.user-clicked-more-button',
        userId: f.createdBy,
      },
    ])
    expect(modelSpace?.screen.t === 'screen-puzzle' && modelSpace?.screen.opened === 'more').toBe(true)
  })

  it("should be able to close 'more' drawer", async () => {
    const f = await Fixture()
    const modelSpace = f.update(f.initial, [
      {
        t: 'screen-pack-builder.user-clicked-pack-item',
        puzzleResult: { t: 'got', c: f.puzzles[0] },
        puzzleIndex: 0,
      },
      {
        t: 'screen-pack-builder.puzzle-screen.user-closed-more-drawer',
        userId: f.createdBy,
      },
    ])
    expect(modelSpace?.screen.t === 'screen-puzzle' && modelSpace?.screen.opened === null).toBe(true)
  })

  it('should be able to go to next puzzle', async () => {
    const f = await Fixture()
    const modelSpace = f.update(f.initial, [
      {
        t: 'screen-pack-builder.user-clicked-pack-item',
        puzzleResult: { t: 'got', c: f.puzzles[0] },
        puzzleIndex: 0,
      },
      {
        t: 'screen-pack-builder.puzzle-screen.user-clicked-next-puzzle',
        userId: f.createdBy,
        nextPuzzleResult: { t: 'got', c: f.puzzles[1] },
      },
    ])
    expect(
      modelSpace?.screen.t === 'screen-puzzle' &&
        modelSpace?.screen.puzzleResult.t === 'got' &&
        modelSpace?.screen.puzzleResult.c.id === f.puzzles[1].id,
    ).toBe(true)
  })

  it('should do nothing if next puzzle is not in pack', async () => {
    const f = await Fixture()
    const modelSpace = f.update(f.initial, [
      {
        t: 'screen-pack-builder.user-clicked-pack-item',
        puzzleResult: { t: 'got', c: f.puzzles[0] },
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
    const f = await Fixture()
    const modelSpace = f.update(f.initial, [
      {
        t: 'screen-pack-builder.user-clicked-pack-item',
        puzzleResult: { t: 'got', c: f.puzzles[1] },
        puzzleIndex: 1,
      },
      {
        t: 'screen-pack-builder.puzzle-screen.user-clicked-previous-puzzle-button',
        userId: f.createdBy,
        previousPuzzleResult: { t: 'got', c: f.puzzles[0] },
      },
    ])
    expect(
      modelSpace?.screen.t === 'screen-puzzle' &&
        modelSpace?.screen.puzzleResult.t === 'got' &&
        modelSpace?.screen.puzzleResult.c.id === f.puzzles[0].id,
    ).toBe(true)
  })

  it('should do nothing if previous puzzle is not in pack', async () => {
    const f = await Fixture()
    const modelSpace = f.update(f.initial, [
      {
        t: 'screen-pack-builder.user-clicked-pack-item',
        puzzleResult: { t: 'got', c: f.puzzles[1] },
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
        modelSpace?.screen.puzzleResult.c.id === f.puzzles[1].id,
    ).toBe(true)
  })

  it('should be able to exit puzzle screen', async () => {
    const f = await Fixture()
    const modelSpace = f.update(f.initial, [
      {
        t: 'screen-pack-builder.user-clicked-pack-item',
        puzzleResult: { t: 'got', c: f.puzzles[1] },
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
    const f = await Fixture()
    const modelSpace = f.update(f.initial, [
      {
        t: 'screen-puzzle-grid.user-clicked-open-add-puzzle-screen-button',
        userId: f.createdBy,
      },
    ])
    expect(modelSpace?.screen.t === 'screen-add-puzzle').toBe(true)
  })

  it('should be on the correct slide index after exiting the puzzle screen', async () => {
    const f = await Fixture({
      puzzleCount: PackPuzzleGridUI.PER_SLIDE_ITEM_COUNT + 1,
    })

    const puzzle = f.puzzles[f.puzzles.length - 1]

    if (!puzzle) throw new Error('Puzzle not found')

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
    const actual = ScreenPackBuilderSpace.toSlideIndex(modelSpace)
    expect(actual).toBe(expected)
  })

  it('should allow user to change slide', async () => {
    const f = await Fixture({
      puzzleCount: PackPuzzleGridUI.PER_SLIDE_ITEM_COUNT + 1,
    })

    const modelSpace = f.update(f.initial, [
      {
        t: 'screen-pack-builder.user-changed-slide',
        newSlideIndex: 1,
        userId: f.createdBy,
      },
    ])
    expect(ScreenPackBuilderSpace.toSlideIndex(f.initial)).toBe(0)
    expect(ScreenPackBuilderSpace.toSlideIndex(modelSpace)).toBe(1)
  })

  it('should prevent slide index from going out of bounds', async () => {
    const f = await Fixture({
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
    expect(ScreenPackBuilderSpace.toSlideIndex(modelSpace)).toBe(expectedSlide)
  })

  it('should go back to grid after exiting puzzle', async () => {
    const f = await Fixture()
    const puzzle = f.puzzles[0]
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
    const f = await Fixture()
    const puzzle = f.puzzles[0]
    const puzzleIndex = 0
    const output = f.update(f.initial, [
      {
        t: 'screen-pack-builder.user-clicked-pack-item',
        puzzleResult: { t: 'got', c: puzzle },
        puzzleIndex,
      },
      {
        t: 'screen-pack-builder.puzzle-screen.user-clicked-more-button',
        userId: f.createdBy,
      },
    ])

    expect(output?.screen.t === 'screen-puzzle' && output?.screen.opened === 'more').toBe(true)
  })

  it('should close the more drawer', async () => {
    const f = await Fixture()
    const puzzle = f.puzzles[0]
    const puzzleIndex = 0
    const output = f.update(f.initial, [
      {
        t: 'screen-pack-builder.user-clicked-pack-item',
        puzzleResult: { t: 'got', c: puzzle },
        puzzleIndex,
      },
      {
        t: 'screen-pack-builder.puzzle-screen.user-clicked-more-button',
        userId: f.createdBy,
      },
      {
        t: 'screen-pack-builder.puzzle-screen.user-closed-more-drawer',
        userId: f.createdBy,
      },
    ])
    expect(output?.screen.t === 'screen-puzzle' && output?.screen.opened === null).toBe(true)
  })

  it('should should remove puzzle from pack clicking remove from pack button', async () => {
    const f = await Fixture()
    const puzzle = f.puzzles[0]
    const puzzleIndex = 0
    const output = f.update(f.initial, [
      {
        t: 'screen-pack-builder.user-clicked-pack-item',
        puzzleResult: { t: 'got', c: puzzle },
        puzzleIndex,
      },
      {
        t: 'screen-pack-builder.puzzle-screen.user-clicked-more-button',
        userId: f.createdBy,
      },
      {
        t: 'remove-puzzle-from-pack.user-clicked-remove-from-pack-button',
        userId: f.createdBy,
        puzzleIndex,
      },
    ])
    expect(output?.screen.t === 'screen-puzzle-grid').toBe(true)
    expect(output).toBeTruthy()
    expect(output?.pack.puzzleIds.includes(puzzle.id)).toBe(false)
  })

  it('should open the correct level when opening puzzle screen', async () => {
    const f = await Fixture({
      puzzleCount: PackPuzzleGridUI.PER_SLIDE_ITEM_COUNT + 1,
    })
    const indexNextPage = PackPuzzleGridUI.PER_SLIDE_ITEM_COUNT + 1
    const modelSpace = f.update(f.initial, [
      {
        t: 'screen-pack-builder.user-clicked-pack-item',
        puzzleResult: { t: 'got', c: f.puzzles[indexNextPage]! },
        puzzleIndex: indexNextPage,
      },
    ])
    expect(modelSpace?.screen.t === 'screen-puzzle' && modelSpace?.screen.puzzleIndex === indexNextPage).toBe(true)
  })

  it('should open the correct level when opening puzzle screen event when there is duplicate puzzles in the pack', async () => {
    const puzzle = await Puzzle.random()
    const f = await Fixture({
      appendDuplicatesOf: puzzle,
    })

    const modelSpace = f.update(f.initial, [
      {
        t: 'screen-pack-builder.user-clicked-pack-item',
        puzzleResult: { t: 'got', c: f.puzzles[f.puzzles.length - 1]! },
        puzzleIndex: f.puzzles.length - 1,
      },
    ])

    expect(modelSpace?.screen.t === 'screen-puzzle' && modelSpace?.screen.puzzleIndex === f.puzzles.length - 1).toBe(
      true,
    )
  })

  it('should not open pack item if puzzle is not at index given', async () => {
    const puzzle = await Puzzle.random()
    const f = await Fixture({
      appendDuplicatesOf: puzzle,
    })

    const puzzleLast = f.puzzles[f.puzzles.length - 1]

    if (!puzzleLast) throw new Error('Puzzle not found')

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
    const f = await Fixture()
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
    const f = await Fixture()
    const modelSpace = f.update(f.initial, [
      {
        t: 'screen-pack-builder.user-clicked-back-button',
        userId: f.createdBy,
      },
    ])
    expect(modelSpace.msgs?.length).toBe(1)
    expect(modelSpace.msgs?.some((m) => m.t === 'exit-pack-builder')).toBe(true)
  })
})
