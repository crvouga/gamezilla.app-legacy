import { describe, expect, it } from 'bun:test'
import { Result } from '~/@/result'
import { withEventId, withEventMeta } from '~/@/event-sourced/event'
import { Pack } from '../../../../@/pack/pack'
import { FlowCreateFixtureServer } from '../../../@/testing/server'
import { EditPackNameCore } from '../core'
import { EditPackNameServer } from '../server'

const Fixture = async () => {
  const f = await FlowCreateFixtureServer()
  const pack = await Pack.random()
  await f.ctx.flowPackDb.put(pack)
  const modelCore = EditPackNameCore.init({ pack })

  return {
    ...f,
    deps: null,
    pack,
    modelCore,
  }
}

describe(import.meta.file, () => {
  it('should persist pack name after user clicks save button', async () => {
    const f = await Fixture()
    const someNewName = 'some new name'
    await EditPackNameServer.update({
      ...f,
      modelCore: {
        ...f.modelCore,
        draft: someNewName,
      },
      msgCore: withEventMeta({
        t: 'edit-pack-name.user-clicked-save-button',
        userId: f.pack.createdBy,
      }),
    })
    const after = Result.unwrapOr(await f.ctx.flowPackDb.get(f.pack.id), null)
    expect(String(after?.name)).toBe(someNewName)
  })

  it('should output persist pack msg core after user clicks save button', async () => {
    const f = await Fixture()
    const someNewName = 'some new name'
    const output = await EditPackNameServer.update({
      ...f,
      modelCore: {
        ...f.modelCore,
        draft: someNewName,
      },
      msgCore: withEventId({
        t: 'edit-pack-name.user-clicked-save-button',
        userId: f.pack.createdBy,
      }),
    })
    expect(output.msgCore?.some((m) => m.t === 'edit-pack-name.server-persisted-pack')).toBe(true)
  })
})
