import { describe, expect, it } from 'bun:test'
import { Result } from '~/@/result'
import { withEventId, withEventMeta } from '~/@/event-sourced/event'
import { Pack } from '../../../../@/pack/pack'
import { FlowCreateFixtureBackend } from '../../../@/testing/backend'
import { EditPackNameCore } from '../core'
import { EditPackNameBackend } from '../backend'

const Fixture = async () => {
  const f = await FlowCreateFixtureBackend()
  const pack = await Pack.random()
  await f.ctx.packDb.put(pack)
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
    await EditPackNameBackend.update({
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
    const after = Result.unwrapOr(await f.ctx.packDb.get(f.pack.id), null)
    expect(String(after?.name)).toBe(someNewName)
  })

  it('should output persist pack msg core after user clicks save button', async () => {
    const f = await Fixture()
    const someNewName = 'some new name'
    const output = await EditPackNameBackend.update({
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
    expect(output.msgCore?.some((m) => m.t === 'edit-pack-name.backend-persisted-pack')).toBe(true)
  })
})
