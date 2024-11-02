import { describe, expect, test } from 'bun:test'
import { ScreenPuzzlePlayCoreChildFixture } from '../@/fixture/core'

const Fixture = async () => {
  const f = ScreenPuzzlePlayCoreChildFixture()
  return {
    ...f
  }
}

describe(import.meta.file, () => {
  test.todo('close action drawer', async () => {
    const f = await Fixture()
    const output = f.updates(f.init, [
      {
        t: 'user-toggled-action-buttons-drawer'
      },
      {
        t: 'user-clicked-copy-to-clipboard'
      }
    ])
    expect(output[0].opened).toBe(null)
  })
})
