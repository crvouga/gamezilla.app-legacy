import { describe, expect, it } from 'bun:test'
import { Err, Ok } from '~/@/result'
import { SpaceFixture } from '~/app/spaces/@/fixture/space'
import { Pack } from '../../../../@/pack/pack'
import { EditPackNameSpace } from '../space'
import type { ModelSpace, MsgSpace } from '../types'

const Fixture = async () => {
  const f = await SpaceFixture()

  const update = (init: ModelSpace, msgs: MsgSpace[]) => {
    return msgs.reduce((model, msg) => EditPackNameSpace.update({ ctx: f.ctx, modelSpace: model, msgSpace: msg }), init)
  }

  const pack = await Pack.random()

  return {
    ...f,
    pack,
    init: EditPackNameSpace.init({
      pack,
    }),
    update,
  }
}

describe(import.meta.file, () => {
  it('should let host input pack name', async () => {
    const f = await Fixture()
    const packNameDraft = 'pack-name'
    const model = f.update(f.init, [
      {
        t: 'edit-pack-name.user-inputted-draft-name',
        userId: f.hostId,
        packNameDraft,
      },
    ])
    expect(model.draft).toBe(packNameDraft)
  })

  it('should only allow host to input pack name', async () => {
    const f = await Fixture()
    const packNameDraft = 'pack-name'
    const model = f.update(f.init, [
      {
        t: 'edit-pack-name.user-inputted-draft-name',
        userId: f.guestId,
        packNameDraft,
      },
    ])
    expect(model.draft).toBe('')
  })

  it('should be loading after saving pack name', async () => {
    const f = await Fixture()
    const model = f.update(f.init, [
      {
        t: 'edit-pack-name.user-clicked-save-button',
        userId: f.hostId,
      },
    ])
    expect(model.result.t).toBe('loading')
  })

  it('should be ok if persisting pack is ok', async () => {
    const f = await Fixture()
    const model = f.update(f.init, [
      {
        t: 'edit-pack-name.backend-persisted-pack',
        userId: f.hostId,
        result: Ok(null),
      },
    ])
    expect(model.result.t).toBe('ok')
  })

  it('should be error if persisting pack is error', async () => {
    const f = await Fixture()
    const model = f.update(f.init, [
      {
        t: 'edit-pack-name.backend-persisted-pack',
        userId: f.hostId,
        result: Err('some error'),
      },
    ])
    expect(model.result.t).toBe('err')
  })

  it('should error if name is empty', async () => {
    const f = await Fixture()
    const model = f.update(f.init, [
      {
        t: 'edit-pack-name.user-inputted-draft-name',
        userId: f.hostId,
        packNameDraft: '',
      },
    ])
    expect(model.validationError?.t).toBe('name-cannot-be-empty')
  })

  it('should clear validation error after input of non empty name', async () => {
    const f = await Fixture()
    const model = f.update(f.init, [
      {
        t: 'edit-pack-name.user-inputted-draft-name',
        userId: f.hostId,
        packNameDraft: '',
      },
      {
        t: 'edit-pack-name.user-inputted-draft-name',
        userId: f.hostId,
        packNameDraft: 'pack-name',
      },
    ])
    expect(model.validationError).toBe(null)
  })

  it('should optimisitcally update pack name', async () => {
    const f = await Fixture()
    const newPackName = 'pack'
    const model = f.update(f.init, [
      {
        t: 'edit-pack-name.user-inputted-draft-name',
        userId: f.hostId,
        packNameDraft: newPackName,
      },
      {
        t: 'edit-pack-name.user-clicked-save-button',
        userId: f.hostId,
      },
    ])
    expect(String(model.pack.name)).toBe(newPackName)
  })

  it('should rollback pack name if persiting errors', async () => {
    const f = await Fixture()
    const model = f.update(f.init, [
      {
        t: 'edit-pack-name.user-inputted-draft-name',
        userId: f.hostId,
        packNameDraft: `${f.pack.name} edits`,
      },
      {
        t: 'edit-pack-name.user-clicked-save-button',
        userId: f.hostId,
      },
      {
        t: 'edit-pack-name.backend-persisted-pack',
        userId: f.hostId,
        result: Err('some error'),
      },
    ])

    expect(model.pack.name).toBe(f.pack.name)
  })
})
