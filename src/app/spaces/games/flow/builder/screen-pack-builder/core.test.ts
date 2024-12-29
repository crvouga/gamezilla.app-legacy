import { describe, expect, it } from 'bun:test'
import { UserId } from '~/app/@/data'
import { SpaceGameCoreFixture } from '~/app/spaces/games/@/testing/sync'
import { Pack } from '../../@/pack/pack'
import { PackPuzzlesGridUI } from '../../@/pack/pack-puzzles-grid/ui'
import { Puzzle } from '../../@/puzzle/puzzle'
import { BuilderCore } from '../core'
import type { ModelCore } from '../types'
import { ScreenPackBuilderCore } from './core'
import type { MsgCore } from './types'

const Fixture = async (input?: { puzzleCount?: number; appendDuplicatesOf?: Puzzle }) => {
  const f = await SpaceGameCoreFixture()
  const createdBy = UserId.generate()

  const puzzlesPromises = [Puzzle.random({ createdBy }), Puzzle.random({ createdBy }), Puzzle.random({ createdBy })]

  for (let i = 0; i < (input?.puzzleCount ?? 0); i++) {
    puzzlesPromises.push(
      Puzzle.random({
        createdBy
      })
    )
  }

  const puzzles = (await Promise.all(puzzlesPromises)) as [Puzzle, Puzzle, Puzzle, ...Puzzle[]]

  if (input?.appendDuplicatesOf) {
    for (let i = 0; i < 3; i++) {
      puzzles.push(input.appendDuplicatesOf)
    }
  }

  const pack = await Pack.random({
    createdBy,
    puzzleIds: puzzles.map((puzzle) => puzzle.id)
  })
  const init = BuilderCore.init({ ctx: f.ctx })
  const modelCore: ModelCore = {
    ...init,
    screenPackBuilder: ScreenPackBuilderCore.init({ pack })
  }

  const updateModelCore = (msgs: MsgCore[]): ModelCore => {
    return msgs.reduce(
      (modelCore, msgCore) =>
        ScreenPackBuilderCore.update({
          ctx: f.ctx,
          modelCore,
          msgCore
        }),
      {
        ...modelCore
      }
    )
  }

  return {
    ...f,
    updateModelCore,
    currentUserId: createdBy,
    pack,
    puzzles,
    modelCore
  }
}

describe(import.meta.file, () => {
  it('should remove puzzle from pack after clicking remove button', async () => {
    const f = await Fixture()

    const modelCore = f.updateModelCore([
      {
        t: 'remove-puzzle-from-pack.user-clicked-remove-from-pack-button',
        userId: f.currentUserId,
        puzzleIndex: 0
      }
    ])

    expect(modelCore.screenPackBuilder?.pack.puzzleIds.includes(f.puzzles[0].id)).toBe(false)
  })

  it('should be able to exit puzzle screen', async () => {
    const f = await Fixture()

    const modelCore = f.updateModelCore([
      {
        t: 'screen-pack-builder.puzzle-screen.user-clicked-exit-puzzle',
        userId: f.currentUserId
      }
    ])

    expect(modelCore.screenPackBuilder?.screen.t === 'screen-puzzle-grid').toBe(true)
  })

  it('should open puzzle screen when clicking puzzle grid item', async () => {
    const f = await Fixture()

    const modelCore = f.updateModelCore([
      {
        t: 'screen-pack-builder.user-clicked-pack-item',
        puzzleResult: { t: 'got', c: f.puzzles[0] },
        puzzleIndex: 0
      }
    ])

    expect(
      modelCore.screenPackBuilder?.screen.t === 'screen-puzzle' &&
        modelCore.screenPackBuilder.screen.puzzleResult.t === 'got' &&
        modelCore.screenPackBuilder.screen.puzzleResult.c.id === f.puzzles[0].id
    ).toBe(true)
  })

  it("should be able to open 'more' drawer", async () => {
    const f = await Fixture()
    const modelCore = f.updateModelCore([
      {
        t: 'screen-pack-builder.user-clicked-pack-item',
        puzzleResult: { t: 'got', c: f.puzzles[0] },
        puzzleIndex: 0
      },
      {
        t: 'screen-pack-builder.puzzle-screen.user-clicked-more-button',
        userId: f.currentUserId
      }
    ])
    expect(
      modelCore.screenPackBuilder?.screen.t === 'screen-puzzle' && modelCore.screenPackBuilder?.screen.opened === 'more'
    ).toBe(true)
  })

  it("should be able to close 'more' drawer", async () => {
    const f = await Fixture()
    const modelCore = f.updateModelCore([
      {
        t: 'screen-pack-builder.user-clicked-pack-item',
        puzzleResult: { t: 'got', c: f.puzzles[0] },
        puzzleIndex: 0
      },
      {
        t: 'screen-pack-builder.puzzle-screen.user-closed-more-drawer',
        userId: f.currentUserId
      }
    ])
    expect(
      modelCore.screenPackBuilder?.screen.t === 'screen-puzzle' && modelCore.screenPackBuilder?.screen.opened === null
    ).toBe(true)
  })

  it('should be able to go to next puzzle', async () => {
    const f = await Fixture()
    const modelCore = f.updateModelCore([
      {
        t: 'screen-pack-builder.user-clicked-pack-item',
        puzzleResult: { t: 'got', c: f.puzzles[0] },
        puzzleIndex: 0
      },
      {
        t: 'screen-pack-builder.puzzle-screen.user-clicked-next-puzzle',
        userId: f.currentUserId,
        nextPuzzleResult: { t: 'got', c: f.puzzles[1] }
      }
    ])
    expect(
      modelCore.screenPackBuilder?.screen.t === 'screen-puzzle' &&
        modelCore.screenPackBuilder?.screen.puzzleResult.t === 'got' &&
        modelCore.screenPackBuilder?.screen.puzzleResult.c.id === f.puzzles[1].id
    ).toBe(true)
  })

  it('should do nothing if next puzzle is not in pack', async () => {
    const f = await Fixture()
    const modelCore = f.updateModelCore([
      {
        t: 'screen-pack-builder.user-clicked-pack-item',
        puzzleResult: { t: 'got', c: f.puzzles[0] },
        puzzleIndex: 0
      },
      {
        t: 'screen-pack-builder.puzzle-screen.user-clicked-next-puzzle',
        userId: f.currentUserId,
        nextPuzzleResult: {
          t: 'got',
          c: await Puzzle.random({
            createdBy: f.currentUserId
          })
        }
      }
    ])

    expect(
      modelCore.screenPackBuilder?.screen.t === 'screen-puzzle' && modelCore.screenPackBuilder?.screen.puzzleIndex === 0
    ).toBe(true)
  })

  it('should be able to go to previous puzzle', async () => {
    const f = await Fixture()
    const modelCore = f.updateModelCore([
      {
        t: 'screen-pack-builder.user-clicked-pack-item',
        puzzleResult: { t: 'got', c: f.puzzles[1] },
        puzzleIndex: 1
      },
      {
        t: 'screen-pack-builder.puzzle-screen.user-clicked-previous-puzzle-button',
        userId: f.currentUserId,
        previousPuzzleResult: { t: 'got', c: f.puzzles[0] }
      }
    ])
    expect(
      modelCore.screenPackBuilder?.screen.t === 'screen-puzzle' &&
        modelCore.screenPackBuilder?.screen.puzzleResult.t === 'got' &&
        modelCore.screenPackBuilder?.screen.puzzleResult.c.id === f.puzzles[0].id
    ).toBe(true)
  })

  it('should do nothing if previous puzzle is not in pack', async () => {
    const f = await Fixture()
    const modelCore = f.updateModelCore([
      {
        t: 'screen-pack-builder.user-clicked-pack-item',
        puzzleResult: { t: 'got', c: f.puzzles[1] },
        puzzleIndex: 1
      },
      {
        t: 'screen-pack-builder.puzzle-screen.user-clicked-previous-puzzle-button',
        userId: f.currentUserId,
        previousPuzzleResult: {
          t: 'got',
          c: await Puzzle.random({
            createdBy: f.currentUserId
          })
        }
      }
    ])
    expect(
      modelCore.screenPackBuilder?.screen.t === 'screen-puzzle' &&
        modelCore.screenPackBuilder?.screen.puzzleResult.t === 'got' &&
        modelCore.screenPackBuilder?.screen.puzzleResult.c.id === f.puzzles[1].id
    ).toBe(true)
  })

  it('should be able to exit puzzle screen', async () => {
    const f = await Fixture()
    const modelCore = f.updateModelCore([
      {
        t: 'screen-pack-builder.user-clicked-pack-item',
        puzzleResult: { t: 'got', c: f.puzzles[1] },
        puzzleIndex: 1
      },
      {
        t: 'screen-pack-builder.puzzle-screen.user-clicked-exit-puzzle',
        userId: f.currentUserId
      }
    ])
    expect(modelCore.screenPackBuilder?.screen.t === 'screen-puzzle-grid').toBe(true)
  })

  it('should be able to open add puzzle screen', async () => {
    const f = await Fixture()
    const modelCore = f.updateModelCore([
      {
        t: 'screen-pack-builder.user-opened-add-puzzle-screen',
        userId: f.currentUserId
      }
    ])
    expect(modelCore.screenPackBuilder?.screen.t === 'screen-add-puzzle').toBe(true)
  })

  it('should be able to close add puzzle screen', async () => {
    const f = await Fixture()
    const modelCore = f.updateModelCore([
      {
        t: 'screen-pack-builder.user-opened-add-puzzle-screen',
        userId: f.currentUserId
      },
      {
        t: 'screen-pack-builder.user-closed-add-puzzle-screen'
      }
    ])
    expect(modelCore.screenPackBuilder?.screen.t === 'screen-puzzle-grid').toBe(true)
  })

  it('should be able to add new puzzle', async () => {
    const f = await Fixture()
    const newPuzzle = await Puzzle.random({
      createdBy: f.currentUserId
    })
    const modelCore = f.updateModelCore([
      {
        t: 'screen-pack-builder.user-clicked-add-puzzle-item',
        puzzle: newPuzzle,
        userId: f.currentUserId
      }
    ])
    expect(modelCore.screenPackBuilder?.pack.puzzleIds.includes(newPuzzle.id)).toBe(true)
  })

  it('should be on the correct slide index after exiting the puzzle screen', async () => {
    const f = await Fixture({
      puzzleCount: PackPuzzlesGridUI.PER_SLIDE_ITEM_COUNT + 1
    })

    const puzzle = f.puzzles[f.puzzles.length - 1]

    if (!puzzle) throw new Error('Puzzle not found')

    const modelCore = f.updateModelCore([
      {
        t: 'screen-pack-builder.user-clicked-pack-item',
        puzzleResult: { t: 'got', c: puzzle },
        puzzleIndex: f.puzzles.length - 1
      },
      {
        t: 'screen-pack-builder.puzzle-screen.user-clicked-exit-puzzle',
        userId: f.currentUserId
      }
    ])

    const expected = PackPuzzlesGridUI.toSlideIndex(modelCore.screenPackBuilder?.pack.puzzleIds.indexOf(puzzle.id) ?? 0)
    const actual = ScreenPackBuilderCore.toSlideIndex(modelCore.screenPackBuilder)
    expect(actual).toBe(expected)
  })

  it('should allow user to change slide', async () => {
    const f = await Fixture({
      puzzleCount: PackPuzzlesGridUI.PER_SLIDE_ITEM_COUNT + 1
    })

    const modelCore = f.updateModelCore([
      {
        t: 'screen-pack-builder.user-changed-slide',
        newSlideIndex: 1,
        userId: f.currentUserId
      }
    ])
    expect(ScreenPackBuilderCore.toSlideIndex(f.modelCore.screenPackBuilder)).toBe(0)
    expect(ScreenPackBuilderCore.toSlideIndex(modelCore.screenPackBuilder)).toBe(1)
  })

  it('should prevent slide index from going out of bounds', async () => {
    const f = await Fixture({
      puzzleCount: PackPuzzlesGridUI.PER_SLIDE_ITEM_COUNT + 1
    })
    const expectedSlide = PackPuzzlesGridUI.toSlideIndex(PackPuzzlesGridUI.PER_SLIDE_ITEM_COUNT + 1)
    const modelCore = f.updateModelCore([
      {
        t: 'screen-pack-builder.user-changed-slide',
        newSlideIndex: 100000,
        userId: f.currentUserId
      }
    ])
    expect(ScreenPackBuilderCore.toSlideIndex(modelCore.screenPackBuilder)).toBe(expectedSlide)
  })

  it('should be on the correct slide when closing the add puzzle screen', async () => {
    const f = await Fixture({
      puzzleCount: PackPuzzlesGridUI.PER_SLIDE_ITEM_COUNT + 1
    })

    const modelCore = f.updateModelCore([
      {
        t: 'screen-pack-builder.user-changed-slide',
        newSlideIndex: 1,
        userId: f.currentUserId
      },
      {
        t: 'screen-pack-builder.user-opened-add-puzzle-screen',
        userId: f.currentUserId
      },
      {
        t: 'screen-pack-builder.user-closed-add-puzzle-screen'
      }
    ])

    expect(ScreenPackBuilderCore.toSlideIndex(f.modelCore.screenPackBuilder)).toBe(0)
    expect(ScreenPackBuilderCore.toSlideIndex(modelCore.screenPackBuilder)).toBe(1)
  })

  it('should open the correct level when opening puzzle screen', async () => {
    const f = await Fixture({
      puzzleCount: PackPuzzlesGridUI.PER_SLIDE_ITEM_COUNT + 1
    })
    const indexNextPage = PackPuzzlesGridUI.PER_SLIDE_ITEM_COUNT + 1
    const modelCore = f.updateModelCore([
      {
        t: 'screen-pack-builder.user-clicked-pack-item',
        puzzleResult: { t: 'got', c: f.puzzles[indexNextPage]! },
        puzzleIndex: indexNextPage
      }
    ])
    expect(
      modelCore.screenPackBuilder?.screen.t === 'screen-puzzle' &&
        modelCore.screenPackBuilder?.screen.puzzleIndex === indexNextPage
    ).toBe(true)
  })

  it('should open the correct level when opening puzzle screen event when there is duplicate puzzles in the pack', async () => {
    const puzzle = await Puzzle.random()
    const f = await Fixture({
      appendDuplicatesOf: puzzle
    })

    const modelCore = f.updateModelCore([
      {
        t: 'screen-pack-builder.user-clicked-pack-item',
        puzzleResult: { t: 'got', c: f.puzzles[f.puzzles.length - 1]! },
        puzzleIndex: f.puzzles.length - 1
      }
    ])

    expect(
      modelCore.screenPackBuilder?.screen.t === 'screen-puzzle' &&
        modelCore.screenPackBuilder?.screen.puzzleIndex === f.puzzles.length - 1
    ).toBe(true)
  })

  it('should not open pack item if puzzle is not at index given', async () => {
    const puzzle = await Puzzle.random()
    const f = await Fixture({
      appendDuplicatesOf: puzzle
    })

    const puzzleLast = f.puzzles[f.puzzles.length - 1]

    if (!puzzleLast) throw new Error('Puzzle not found')

    const modelCore = f.updateModelCore([
      {
        t: 'screen-pack-builder.user-clicked-pack-item',
        puzzleResult: { t: 'got', c: puzzleLast },
        puzzleIndex: 0
      }
    ])

    expect(modelCore.screenPackBuilder?.screen.t === 'screen-puzzle-grid').toBe(true)
  })

  it('should open not-found puzzle', async () => {
    const f = await Fixture()
    const modelCore = f.updateModelCore([
      {
        t: 'screen-pack-builder.user-clicked-pack-item',
        puzzleResult: { t: 'not-found' },
        puzzleIndex: 0
      }
    ])
    expect(modelCore.screenPackBuilder?.screen.t === 'screen-puzzle').toBe(true)
  })
})
