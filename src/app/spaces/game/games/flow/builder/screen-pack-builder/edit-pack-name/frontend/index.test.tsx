import { describe, expect, it } from 'bun:test'
import { withEventId } from '~/@/event-sourced/event'
import { Err } from '~/@/result'
import { didShowErrorSm } from '~/app/@/frontend/cmd'
import { FixtureSpacesFrontend } from '~/app/spaces/@/fixture/frontend'
import { Pack } from '../../../../@/pack/pack'
import { EditPackNameFrontend } from '../frontend'
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

  it('should show error if persisting pack fails', async () => {
    const f = await Fixture()
    const output = EditPackNameFrontend.update({
      ...f,
      msgSpace: withEventId({
        t: 'edit-pack-name.backend-persisted-pack',
        result: Err('something errored'),
        userId: f.ctx.space.hostId,
      }),
    })
    expect(didShowErrorSm(output)).toBe(true)
  })
})
