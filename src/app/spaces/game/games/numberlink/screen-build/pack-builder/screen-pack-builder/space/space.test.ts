import { beforeEach, describe, expect, it, test } from 'bun:test'
import { assertNotNullish } from '~/@/assert'
import { PackPuzzleGridUI } from '../../../../@/pack/pack-puzzle-grid-ui'
import { Puzzle } from '../../../../@/puzzle/puzzle'
import { ScreenPackBuildSpaceFixture } from '../@/fixture/space'
import { ScreenPackBuildSpace } from './space'

const Fixture = ScreenPackBuildSpaceFixture

describe(import.meta.file, () => {
  let f: Awaited<ReturnType<typeof Fixture>>

  beforeEach(async () => {
    f = await Fixture()
  })

  describe('puzzle grid', () => {
    it('should be able to open add puzzle screen', async () => {
      const modelSpace = f.update(f.initial, [
        {
          t: 'screen-puzzle-grid.user-clicked-open-add-puzzle-screen-button',
          userId: f.createdBy,
        },
      ])
      expect(modelSpace?.screen.t === 'screen-add-puzzle').toBe(true)
    })

    describe('slide management', () => {
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
    })
  })

  describe('puzzle opening behavior', () => {
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
})
