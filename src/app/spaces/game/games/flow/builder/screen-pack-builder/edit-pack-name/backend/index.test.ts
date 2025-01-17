import { describe, expect, it } from 'bun:test'
import { Result } from '~/@/result'
import { withEventId, withEventMeta } from '~/@/event-sourced/event'
import { Pack } from '../../../../@/pack/pack'
import { FlowCreateFixtureBackend } from '../../../@/fixture/backend'
import { EditPackNameSpace } from '../space'
import { EditPackNameBackend } from '../backend'

const Fixture = async () => {
  const f = await FlowCreateFixtureBackend()
  const pack = await Pack.random()
  await f.ctx.packDb.put(pack)
  const modelSpace = EditPackNameSpace.init({ pack })

  return {
    ...f,
    deps: null,
    pack,
    modelSpace,
  }
}

describe(import.meta.file, () => {
  it('should persist pack name after user clicks save button', async () => {
    const f = await Fixture()
    const someNewName = 'some new name'
    await EditPackNameBackend.update({
      ...f,
      modelSpace: {
        ...f.modelSpace,
        draft: someNewName,
      },
      msgSpace: withEventMeta({
        t: 'edit-pack-name.user-clicked-save-button',
        userId: f.pack.createdBy,
      }),
    })
    const after = Result.unwrapOr(await f.ctx.packDb.get(f.pack.id), null)
    expect(String(after?.name)).toBe(someNewName)
  })

  it('should output persist pack msg space after user clicks save button', async () => {
    const f = await Fixture()
    const someNewName = 'some new name'
    const output = await EditPackNameBackend.update({
      ...f,
      modelSpace: {
        ...f.modelSpace,
        draft: someNewName,
      },
      msgSpace: withEventId({
        t: 'edit-pack-name.user-clicked-save-button',
        userId: f.pack.createdBy,
      }),
    })
    expect(output.msgSpace?.some((m) => m.t === 'edit-pack-name.backend-persisted-pack')).toBe(true)
  })
})
