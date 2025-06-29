import { assertNotNullish } from '~/@/assert'
import { describe, expect, test } from '~/@/test-runner'
import { Pack } from '../../../../@/pack/pack'
import { PackPuzzleGridUI } from '../../../../@/pack/pack-puzzle-grid-ui'
import { Puzzle } from '../../../../@/puzzle/puzzle'
import { ScreenPackBuildSpaceFixture } from '../@/fixture/space'
import { ScreenPackBuildSpace } from '../space/space'

const Fixture = async (...params: Parameters<typeof ScreenPackBuildSpaceFixture>) => {
  const f = await ScreenPackBuildSpaceFixture(...params)
  const initial = f.update(f.initial, [
    {
      t: 'screen-puzzle-grid.user-clicked-open-add-puzzle-screen-button',
      userId: f.createdBy,
    },
  ])

  return {
    ...f,
    initial,
  }
}

describe('ScreenAddPuzzleSpace', () => {
  test('should unselect all puzzles after submitting form', async () => {
    const f = await Fixture()
    const puzzle = await Puzzle.random()
    const before = f.update(f.initial, [
      {
        t: 'screen-pack-builder.screen-add-puzzle.user-clicked-puzzle-list-item',
        puzzleId: puzzle.id,
        userId: f.createdBy,
      },
    ])

    const after = f.update(before, [
      {
        t: 'screen-pack-builder.screen-add-puzzle.user-submitted-add-puzzles-form',
        userId: f.createdBy,
      },
    ])

    expect(before?.screenAddPuzzle_selected.length).toEqual(1)
    expect(before?.screenAddPuzzle_selected.includes(puzzle.id)).toEqual(true)
    expect(after?.screenAddPuzzle_selected.length).toEqual(0)
  })

  test('selecting puzzles', async () => {
    const puzzle = await Puzzle.random()
    const f = await Fixture()
    const output = f.update(f.initial, [
      {
        t: 'screen-pack-builder.screen-add-puzzle.user-clicked-puzzle-list-item',
        puzzleId: puzzle.id,
        userId: f.createdBy,
      },
    ])

    expect(output?.screenAddPuzzle_selected.length).toEqual(1)
    expect(output?.screenAddPuzzle_selected.includes(puzzle.id)).toEqual(true)
  })

  test('toggling puzzles', async () => {
    const puzzle = await Puzzle.random()
    const f = await Fixture()
    const before = f.update(f.initial, [
      {
        t: 'screen-pack-builder.screen-add-puzzle.user-clicked-puzzle-list-item',
        puzzleId: puzzle.id,
        userId: f.createdBy,
      },
    ])
    const after = f.update(before, [
      {
        t: 'screen-pack-builder.screen-add-puzzle.user-clicked-puzzle-list-item',
        puzzleId: puzzle.id,
        userId: f.createdBy,
      },
    ])

    expect(before?.screenAddPuzzle_selected.length).toEqual(1)
    expect(before?.screenAddPuzzle_selected.includes(puzzle.id)).toEqual(true)
    //
    expect(after?.screenAddPuzzle_selected.length).toEqual(0)
    expect(after?.screenAddPuzzle_selected.includes(puzzle.id)).toEqual(false)
  })

  test('should be able to close add puzzle screen', async () => {
    const f = await Fixture()
    const modelSpace = f.update(f.initial, [
      {
        t: 'screen-pack-builder.screen-add-puzzle.user-clicked-close',
        userId: f.createdBy,
      },
    ])
    expect(modelSpace?.screen.t === 'screen-puzzle-grid').toEqual(true)
  })

  test('should be able to add new puzzle', async () => {
    const f = await Fixture()
    const newPuzzle = await Puzzle.random({
      createdBy: f.createdBy,
    })
    const modelSpace = f.update(f.initial, [
      {
        t: 'screen-pack-builder.screen-add-puzzle.user-clicked-puzzle-list-item',
        puzzleId: newPuzzle.id,
        userId: f.createdBy,
      },
      {
        t: 'screen-pack-builder.screen-add-puzzle.user-submitted-add-puzzles-form',
        userId: f.createdBy,
      },
    ])
    expect(modelSpace?.pack.puzzleIds.includes(newPuzzle.id)).toEqual(true)
  })

  test('should be on the correct slide when closing the add puzzle screen', async () => {
    const f = await Fixture({
      puzzleCount: PackPuzzleGridUI.PER_SLIDE_ITEM_COUNT + 1,
    })

    const modelSpace = f.update(f.initial, [
      {
        t: 'screen-pack-builder.user-changed-slide',
        newSlideIndex: 1,
        userId: f.createdBy,
      },
      {
        t: 'screen-puzzle-grid.user-clicked-open-add-puzzle-screen-button',
        userId: f.createdBy,
      },
      {
        t: 'screen-pack-builder.screen-add-puzzle.user-clicked-close',
        userId: f.createdBy,
      },
    ])

    expect(ScreenPackBuildSpace.toSlideIndex(f.initial)).toEqual(0)
    expect(ScreenPackBuildSpace.toSlideIndex(modelSpace)).toEqual(1)
  })

  test('should open puzzle when user clicks puzzle grid item', async () => {
    const f = await Fixture()
    const output = f.update(f.initial, [
      {
        t: 'screen-puzzle-grid.user-clicked-open-add-puzzle-screen-button',
        userId: f.createdBy,
      },
      {
        t: 'screen-pack-builder.screen-add-puzzle.user-clicked-puzzle-list-item',
        puzzleId: assertNotNullish(f.puzzles[0]).id,
        userId: f.createdBy,
      },
      {
        t: 'screen-pack-builder.screen-add-puzzle.user-submitted-add-puzzles-form',
        userId: f.createdBy,
      },
      {
        t: 'screen-pack-builder.user-clicked-pack-item',
        puzzleResult: { t: 'got', c: assertNotNullish(f.puzzles[0]) },
        puzzleIndex: 0,
      },
    ])

    expect(output?.screen.t === 'screen-puzzle' && output.screen.puzzleIndex === 0).toEqual(true)
  })

  test('should open puzzle picker when user clicks add puzzle button', async () => {
    const f = await Fixture()
    const output = f.update(f.initial, [
      {
        t: 'screen-puzzle-grid.user-clicked-open-add-puzzle-screen-button',
        userId: f.createdBy,
      },
    ])
    expect(output?.screen.t === 'screen-add-puzzle').toEqual(true)
  })

  test('should close puzzle picker when user clicks closes', async () => {
    const f = await Fixture()
    const output = f.update(f.initial, [
      {
        t: 'screen-puzzle-grid.user-clicked-open-add-puzzle-screen-button',
        userId: f.createdBy,
      },
      {
        t: 'screen-pack-builder.screen-add-puzzle.user-clicked-close',
        userId: f.createdBy,
      },
    ])
    expect(output?.screen.t === 'screen-puzzle-grid').toEqual(true)
  })

  test('should add puzzle to the pack after clicking a puzzle in the picker', async () => {
    const f = await Fixture()
    const puzzle = await Puzzle.random()
    const output = f.update(f.initial, [
      {
        t: 'screen-puzzle-grid.user-clicked-open-add-puzzle-screen-button',
        userId: f.createdBy,
      },
      {
        t: 'screen-pack-builder.screen-add-puzzle.user-clicked-puzzle-list-item',
        puzzleId: puzzle.id,
        userId: f.createdBy,
      },
      {
        t: 'screen-pack-builder.screen-add-puzzle.user-submitted-add-puzzles-form',
        userId: f.createdBy,
      },
    ])

    expect(output && Pack.includes(output.pack, puzzle.id)).toEqual(true)
  })

  test('should close puzzle picker after adding a puzzle to the pack', async () => {
    const f = await Fixture()
    const puzzle = await Puzzle.random()
    const output = f.update(f.initial, [
      {
        t: 'screen-puzzle-grid.user-clicked-open-add-puzzle-screen-button',
        userId: f.createdBy,
      },
      {
        t: 'screen-pack-builder.screen-add-puzzle.user-clicked-puzzle-list-item',
        puzzleId: puzzle.id,
        userId: f.createdBy,
      },
      {
        t: 'screen-pack-builder.screen-add-puzzle.user-submitted-add-puzzles-form',
        userId: f.createdBy,
      },
    ])
    expect(output?.screen.t === 'screen-puzzle-grid').toEqual(true)
  })

  test('select all puzzles after clicking header checkbox', async () => {
    const f = await Fixture()
    const puzzles = await Promise.all(Array.from({ length: 10 }, () => Puzzle.random()))
    const puzzleIds = puzzles.map((p) => p.id)
    const output = f.update(f.initial, [
      {
        t: 'screen-pack-builder.screen-add-puzzle.user-clicked-header-checkbox',
        puzzleIds: puzzleIds,
        userId: f.createdBy,
      },
    ])
    expect(output?.screenAddPuzzle_selected).toEqual(puzzleIds)
  })

  test('unselect all puzzles after clicking header checkbox when all are selected', async () => {
    const f = await Fixture()
    const puzzles = await Promise.all(Array.from({ length: 10 }, () => Puzzle.random()))
    const puzzleIds = puzzles.map((p) => p.id)
    const output = f.update(f.initial, [
      {
        t: 'screen-pack-builder.screen-add-puzzle.user-clicked-header-checkbox',
        puzzleIds: puzzleIds,
        userId: f.createdBy,
      },
      {
        t: 'screen-pack-builder.screen-add-puzzle.user-clicked-header-checkbox',
        puzzleIds: puzzleIds,
        userId: f.createdBy,
      },
    ])
    expect(output?.screenAddPuzzle_selected).toEqual([])
  })

  test('unselect all after closing screen', async () => {
    const f = await Fixture()
    const puzzles = await Promise.all(Array.from({ length: 10 }, () => Puzzle.random()))
    const puzzleIds = puzzles.map((p) => p.id)
    const before = f.update(f.initial, [
      {
        t: 'screen-pack-builder.screen-add-puzzle.user-clicked-header-checkbox',
        puzzleIds: puzzleIds,
        userId: f.createdBy,
      },
    ])
    const after = f.update(before, [
      {
        t: 'screen-pack-builder.screen-add-puzzle.user-clicked-close',
        userId: f.createdBy,
      },
    ])
    expect(before?.screenAddPuzzle_selected.length > 0).toEqual(true)
    expect(after?.screenAddPuzzle_selected.length).toEqual(0)
  })
})
