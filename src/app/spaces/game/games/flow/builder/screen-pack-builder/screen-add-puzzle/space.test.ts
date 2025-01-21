import { describe, expect, it } from 'bun:test'
import { Pack } from '../../../@/pack/pack'
import { PackPuzzleGridUI } from '../../../@/pack/pack-puzzle-grid-ui'
import { Puzzle } from '../../../@/puzzle/puzzle'
import { ScreenPackBuilderSpaceFixture } from '../@/fixture/space'
import { ScreenPackBuilderSpace } from '../space'

const Fixture = ScreenPackBuilderSpaceFixture

describe(import.meta.file, () => {
  it('should be able to close add puzzle screen', async () => {
    const f = await Fixture()
    const modelSpace = f.update([
      {
        t: 'screen-pack-builder.user-clicked-open-add-puzzle-screen-button',
        userId: f.createdBy,
      },
      {
        t: 'screen-pack-builder.screen-add-puzzle.user-clicked-close',
      },
    ])
    expect(modelSpace?.screen.t === 'screen-puzzle-grid').toBe(true)
  })

  it('should be able to add new puzzle', async () => {
    const f = await Fixture()
    const newPuzzle = await Puzzle.random({
      createdBy: f.createdBy,
    })
    const modelSpace = f.update([
      {
        t: 'screen-pack-builder.screen-add-puzzle.user-clicked-puzzle',
        puzzle: newPuzzle,
        userId: f.createdBy,
      },
    ])
    expect(modelSpace?.pack.puzzleIds.includes(newPuzzle.id)).toBe(true)
  })

  it('should be on the correct slide when closing the add puzzle screen', async () => {
    const f = await Fixture({
      puzzleCount: PackPuzzleGridUI.PER_SLIDE_ITEM_COUNT + 1,
    })

    const modelSpace = f.update([
      {
        t: 'screen-pack-builder.user-changed-slide',
        newSlideIndex: 1,
        userId: f.createdBy,
      },
      {
        t: 'screen-pack-builder.user-clicked-open-add-puzzle-screen-button',
        userId: f.createdBy,
      },
      {
        t: 'screen-pack-builder.screen-add-puzzle.user-clicked-close',
      },
    ])

    expect(ScreenPackBuilderSpace.toSlideIndex(f.modelSpace)).toBe(0)
    expect(ScreenPackBuilderSpace.toSlideIndex(modelSpace)).toBe(1)
  })

  it('should open puzzle when user clicks puzzle grid item', async () => {
    const f = await Fixture()

    const output = f.update([
      {
        t: 'screen-pack-builder.user-clicked-open-add-puzzle-screen-button',
        userId: f.createdBy,
      },
      {
        t: 'screen-pack-builder.screen-add-puzzle.user-clicked-puzzle',
        puzzle: f.puzzles[0],
        userId: f.createdBy,
      },
      {
        t: 'screen-pack-builder.user-clicked-pack-item',
        puzzleResult: { t: 'got', c: f.puzzles[0] },
        puzzleIndex: 0,
      },
    ])

    expect(output?.screen.t === 'screen-puzzle' && output.screen.puzzleIndex === 0).toBe(true)
  })

  it('should open puzzle picker when user clicks add puzzle button', async () => {
    const f = await Fixture()
    const output = f.update([
      {
        t: 'screen-pack-builder.user-clicked-open-add-puzzle-screen-button',
        userId: f.createdBy,
      },
    ])
    expect(output?.screen.t === 'screen-add-puzzle').toBe(true)
  })

  it('should close puzzle picker when user clicks closes', async () => {
    const f = await Fixture()
    const output = f.update([
      {
        t: 'screen-pack-builder.user-clicked-open-add-puzzle-screen-button',
        userId: f.createdBy,
      },
      {
        t: 'screen-pack-builder.screen-add-puzzle.user-clicked-close',
      },
    ])
    expect(output?.screen.t === 'screen-puzzle-grid').toBe(true)
  })

  it('should add puzzle to the pack after clicking a puzzle in the picker', async () => {
    const f = await Fixture()
    const puzzle = await Puzzle.random()
    const output = f.update([
      {
        t: 'screen-pack-builder.user-clicked-open-add-puzzle-screen-button',
        userId: f.createdBy,
      },
      {
        t: 'screen-pack-builder.screen-add-puzzle.user-clicked-puzzle',
        puzzle,
        userId: f.createdBy,
      },
    ])

    expect(output && Pack.includes(output.pack, puzzle.id)).toBe(true)
  })

  it('should close puzzle picker after adding a puzzle to the pack', async () => {
    const f = await Fixture()
    const puzzle = await Puzzle.random()
    const output = f.update([
      {
        t: 'screen-pack-builder.user-clicked-open-add-puzzle-screen-button',
        userId: f.createdBy,
      },
      {
        t: 'screen-pack-builder.screen-add-puzzle.user-clicked-puzzle',
        puzzle,
        userId: f.createdBy,
      },
    ])
    expect(output?.screen.t === 'screen-puzzle-grid').toBe(true)
  })
})
