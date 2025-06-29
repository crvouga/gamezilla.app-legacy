import { assertNotNullish } from '~/@/assert'
import { describe, expect, test } from '~/@/test-runner'
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
  test('should remove puzzle from pack after clicking remove button', async () => {
    const f = await Fixture()
    const modelSpace = f.update(f.initial, [
      {
        t: 'remove-puzzle-from-pack.user-clicked-remove-from-pack-button',
        userId: f.createdBy,
        puzzleIndex: f.puzzleIndex,
      },
    ])

    expect(modelSpace?.pack.puzzleIds.includes(f.puzzle.id)).toEqual(false)
  })

  test('should close more drawer when removing puzzle', async () => {
    const f = await Fixture()
    const output = f.update(f.initial, [
      {
        t: 'remove-puzzle-from-pack.user-clicked-remove-from-pack-button',
        userId: f.createdBy,
        puzzleIndex: f.puzzleIndex,
      },
    ])
    expect(output?.opened).toEqual(null)
  })

  test('should navigate back to puzzle grid when removing puzzle', async () => {
    const f = await Fixture()
    const output = f.update(f.initial, [
      {
        t: 'remove-puzzle-from-pack.user-clicked-remove-from-pack-button',
        userId: f.createdBy,
        puzzleIndex: f.puzzleIndex,
      },
    ])
    expect(output?.screen.t === 'screen-puzzle-grid').toEqual(true)
  })
})
