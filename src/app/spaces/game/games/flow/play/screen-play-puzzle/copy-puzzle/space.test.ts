import { describe, expect, test } from 'bun:test'
import { FixtureScreenPuzzlePlaySpaceChild } from '../@/fixture/space'

const Fixture = async () => {
  const f = FixtureScreenPuzzlePlaySpaceChild()
  return {
    ...f,
  }
}

describe(import.meta.file, () => {
  test.todo('close action drawer', async () => {
    const f = await Fixture()
    const output = f.updates(f.init, [
      {
        t: 'user-toggled-action-buttons-drawer',
        userId: f.hostId,
      },
      {
        t: 'user-clicked-copy-to-clipboard',
        // userId: f.hostId,
      },
    ])
    expect(output[0].opened).toBe(null)
  })
})
