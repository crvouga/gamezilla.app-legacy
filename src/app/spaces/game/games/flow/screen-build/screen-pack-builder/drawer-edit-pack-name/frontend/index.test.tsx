import { describe, expect, it } from 'bun:test'
import { FixtureSpacesFrontend } from '~/app/spaces/@/fixture/frontend'
import { Pack } from '../../../../@/pack/pack'
import { EditPackNameFrontend } from '.'
import { EditPackNameSpace } from '../space'
import type { MsgSpace } from '../types'

const Fixture = async () => {
  const f = await FixtureSpacesFrontend()

  const pack = await Pack.random()

  const modelSpace = EditPackNameSpace.init({ pack })
  const model = null
  return {
    ...f,
    ctx: {
      ...f.ctx,
      open: false,
    },
    model,
    modelSpace,
    pack,
  }
}

describe(import.meta.file, () => {
  it('should propagate space event', async () => {
    const f = await Fixture()
    const msgSpaces: MsgSpace[] = [
      {
        t: 'edit-pack-name.user-inputted-draft-name',
        userId: f.ctx.space.hostId,
        packNameDraft: 'pack-name',
      },
      {
        t: 'edit-pack-name.user-clicked-save-button',
        userId: f.ctx.space.hostId,
      },
    ]
    for (const msgSpace of msgSpaces) {
      const output = EditPackNameFrontend.update({
        ...f,
        msg: msgSpace,
      })
      expect(output.msgSpace?.some((msg) => msg.t === msgSpace.t)).toBe(true)
    }
  })
})
