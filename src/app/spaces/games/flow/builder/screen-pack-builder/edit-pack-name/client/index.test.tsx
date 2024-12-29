import { describe, expect, it } from 'bun:test'
import { Err } from '~/@/core'
import { withEventId } from '~/@/event-sourced/event'
import { didShowErrorSm } from '~/app/@/client'
import { FixtureSpacesClient } from '~/app/spaces/@/fixture/client'
import { Pack } from '../../../../@/pack/pack'
import { EditPackNameClient } from '../client'
import { EditPackNameCore } from '../core'
import type { MsgCore } from '../types'

const Fixture = async () => {
  const f = await FixtureSpacesClient()

  const pack = await Pack.random()

  const modelCore = EditPackNameCore.init({ pack })
  const model = null
  return {
    ...f,
    ctx: {
      ...f.ctx,
      open: false
    },
    model,
    modelCore,
    pack
  }
}

describe(import.meta.file, () => {
  it('should propagate space event', async () => {
    const f = await Fixture()
    const msgCores: MsgCore[] = [
      {
        t: 'edit-pack-name.user-inputted-draft-name',
        userId: f.ctx.space.hostId,
        packNameDraft: 'pack-name'
      },
      {
        t: 'edit-pack-name.user-clicked-save-button',
        userId: f.ctx.space.hostId
      }
    ]
    for (const msgCore of msgCores) {
      const output = EditPackNameClient.update({
        ...f,
        msg: msgCore
      })
      expect(output.msgCore?.some((msg) => msg.t === msgCore.t)).toBe(true)
    }
  })

  it('should show error if persisting pack fails', async () => {
    const f = await Fixture()
    const output = EditPackNameClient.update({
      ...f,
      msgCore: withEventId({
        t: 'edit-pack-name.server-persisted-pack',
        result: Err('something errored'),
        userId: f.ctx.space.hostId
      })
    })
    expect(didShowErrorSm(output)).toBe(true)
  })
})
