import { describe, expect, test } from '~/@/test-runner'
import { FixtureScreenPuzzlePlaySpace } from '../@/fixture/space'

const Fixture = async () => {
  const f = await FixtureScreenPuzzlePlaySpace()

  return {
    ...f,
  }
}

describe('NumberLinkScreenPlayPuzzleLastPuzzleSpace', () => {
  test('should exit to pack list after clicking "select next pack" button', async () => {
    const f = await Fixture()
    const before = f.update(f.init, f.solvePuzzleMsgs)
    const after = f.update(before, [
      {
        t: 'user-clicked-select-next-pack',
        userId: f.hostId,
      },
    ])
    expect(before.screen.t).toEqual('screen-play-puzzle')
    expect(after.screen.t).toEqual('screen-select-pack')
  })
})
