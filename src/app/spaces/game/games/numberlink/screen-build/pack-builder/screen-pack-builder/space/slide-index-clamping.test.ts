import { beforeEach, describe, expect, test } from 'bun:test'
import { PackPuzzleGridUI } from '../../../../@/pack/pack-puzzle-grid-ui'
import { ScreenPackBuildSpaceFixture } from '../@/fixture/space'
import { ScreenPackBuildSpace } from './space'

const Fixture = ScreenPackBuildSpaceFixture

describe('slide index clamping', () => {
  let f: Awaited<ReturnType<typeof Fixture>>

  beforeEach(async () => {
    f = await Fixture()
  })

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
