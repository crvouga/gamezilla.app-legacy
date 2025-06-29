import { assertNotNullish } from '~/@/assert'
import { describe, expect, test } from '~/@/test-runner'
import { ScreenPackBuildSpaceFixture } from '../@/fixture/space'

const Fixture = ScreenPackBuildSpaceFixture

describe('puzzle screen navigation', () => {
  test('should be able to exit puzzle screen', async () => {
    const f = await Fixture()
    const modelSpace = f.update(f.initial, [
      {
        t: 'screen-pack-builder.puzzle-screen.user-clicked-exit-play-puzzle-screen',
        userId: f.createdBy,
      },
    ])

    expect(modelSpace?.screen.t === 'screen-puzzle-grid').toEqual(true)
  })

  test('should open puzzle screen when clicking puzzle grid item', async () => {
    const f = await Fixture()
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
    ).toEqual(true)
  })

  describe('puzzle navigation', () => {
    test('should be able to go to next puzzle', async () => {
      const f = await Fixture()
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
      ).toEqual(true)
    })

    test('should be able to go to previous puzzle', async () => {
      const f = await Fixture()
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
      ).toEqual(true)
    })

    test('should go to previous puzzle even when puzzle result is not found', async () => {
      const f = await Fixture()
      const modelSpace = f.update(f.initial, [
        {
          t: 'screen-pack-builder.user-clicked-pack-item',
          puzzleResult: { t: 'got', c: assertNotNullish(f.puzzles[1]) },
          puzzleIndex: 1,
        },
        {
          t: 'screen-pack-builder.puzzle-screen.user-clicked-previous-puzzle-button',
          userId: f.createdBy,
          previousPuzzleResult: { t: 'not-found' },
        },
      ])
      expect(modelSpace?.screen.t === 'screen-puzzle' && modelSpace?.screen.puzzleIndex === 0).toEqual(true)
    })

    test('should go to next puzzle even when puzzle result is not found', async () => {
      const f = await Fixture()
      const modelSpace = f.update(f.initial, [
        {
          t: 'screen-pack-builder.user-clicked-pack-item',
          puzzleResult: { t: 'got', c: assertNotNullish(f.puzzles[0]) },
          puzzleIndex: 0,
        },
        {
          t: 'screen-pack-builder.puzzle-screen.user-clicked-next-puzzle',
          userId: f.createdBy,
          nextPuzzleResult: { t: 'not-found' },
        },
      ])
      expect(modelSpace?.screen.t === 'screen-puzzle' && modelSpace?.screen.puzzleIndex === 1).toEqual(true)
    })
  })
})
