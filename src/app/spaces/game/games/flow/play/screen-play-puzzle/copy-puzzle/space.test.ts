import { describe, expect, test } from 'bun:test'
import { ScreenPuzzlePlaySpaceChildFixture } from '../@/fixture/space'

const Fixture = async () => {
  const f = ScreenPuzzlePlaySpaceChildFixture()
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
      },
      {
        t: 'user-clicked-copy-to-clipboard',
      },
    ])
    expect(output[0].opened).toBe(null)
  })
})
