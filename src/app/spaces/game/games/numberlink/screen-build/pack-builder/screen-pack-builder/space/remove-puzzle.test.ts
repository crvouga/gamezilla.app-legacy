import { beforeEach, describe, expect, test } from 'vitest'
import { assertNotNullish } from '~/@/assert'
import { ScreenPackBuildSpaceFixture } from '../@/fixture/space'

const Fixture = async (props?: Parameters<typeof ScreenPackBuildSpaceFixture>[0]) => {
  const fixture = await ScreenPackBuildSpaceFixture(props)
  const puzzle = assertNotNullish(fixture.puzzles[0])
  const puzzleIndex = 0
  const initial = fixture.update(fixture.initial, [
    {
      t: 'screen-pack-builder.user-clicked-pack-item',
      puzzleResult: { t: 'got', c: puzzle },
      puzzleIndex,
    },
    {
      t: 'screen-pack-builder.puzzle-screen.user-clicked-open-more-drawer-button',
      userId: fixture.createdBy,
    },
  ])
  return {
    ...fixture,
    puzzle,
    puzzleIndex,
    initial,
  }
}

describe('remove puzzle from pack', () => {
  let f: Awaited<ReturnType<typeof Fixture>>

  beforeEach(async () => {
    f = await Fixture()
  })

  test('should remove puzzle from pack after clicking remove button', async () => {
    const modelSpace = f.update(f.initial, [
      {
        t: 'remove-puzzle-from-pack.user-clicked-remove-from-pack-button',
        userId: f.createdBy,
        puzzleIndex: f.puzzleIndex,
      },
    ])

    expect(modelSpace?.pack.puzzleIds.includes(f.puzzle.id)).toBe(false)
  })

  test('should close more drawer when removing puzzle', async () => {
    const output = f.update(f.initial, [
      {
        t: 'remove-puzzle-from-pack.user-clicked-remove-from-pack-button',
        userId: f.createdBy,
        puzzleIndex: f.puzzleIndex,
      },
    ])
    expect(output?.opened).toBe(null)
  })

  test('should navigate back to puzzle grid when removing puzzle', async () => {
    const output = f.update(f.initial, [
      {
        t: 'remove-puzzle-from-pack.user-clicked-remove-from-pack-button',
        userId: f.createdBy,
        puzzleIndex: f.puzzleIndex,
      },
    ])
    expect(output?.screen.t === 'screen-puzzle-grid').toBe(true)
  })
})
