import { describe, expect, it } from 'bun:test'
import { Err } from '@/core'
import { didShowErrorSm } from 'gamezilla-app/app/@/client'
import { FixtureSpaceClient } from 'gamezilla-app/app/spaces/@/fixture/client'
import { FlowPack } from '../../../@/pack/pack'
import { EditPackNameClient } from './client'
import { EditPackNameCore } from './core'
import type { MsgCore } from './types'
import { withEventId } from '@/event-sourced/event'

const Fixture = async () => {
  const f = await FixtureSpaceClient()

  const pack = await FlowPack.random()

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
