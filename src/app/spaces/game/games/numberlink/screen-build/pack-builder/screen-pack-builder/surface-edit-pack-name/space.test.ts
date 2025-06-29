import { describe, expect, test } from '~/@/test-runner'
import { ScreenPackBuildSpaceFixture } from '../@/fixture/space'

const Fixture = async () => {
  const f = await ScreenPackBuildSpaceFixture()
  return {
    ...f,
  }
}

describe('SurfaceEditPackNameSpace', () => {
  test('should let host input pack name', async () => {
    const f = await Fixture()
    const packNameDraft = 'pack-name'
    const model = f.update(f.initial, [
      {
        t: 'edit-pack-name.user-inputted-draft-name',
        userId: f.hostId,
        packNameDraft,
      },
    ])
    expect(model.editPackName_draft).toEqual(packNameDraft)
  })

  test('should only allow host to input pack name', async () => {
    const f = await Fixture()

    const model = f.update(f.initial, [
      {
        t: 'edit-pack-name.user-inputted-draft-name',
        userId: f.guestId,
        packNameDraft: 'some-name',
      },
    ])
    const before = f.initial.pack.name
    const after = model.pack.name
    expect(after).toEqual(before)
  })

  test('should be loading after saving pack name', async () => {
    const f = await Fixture()
    const model = f.update(f.initial, [
      {
        t: 'edit-pack-name.user-submitted-form',
        userId: f.hostId,
      },
    ])
    expect(model.editPackName_result.t).toEqual('loading')
  })

  test('should error if name is empty', async () => {
    const f = await Fixture()
    const model = f.update(f.initial, [
      {
        t: 'edit-pack-name.user-inputted-draft-name',
        userId: f.hostId,
        packNameDraft: '',
      },
      {
        t: 'edit-pack-name.user-submitted-form',
        userId: f.hostId,
      },
    ])
    expect(model.editPackName_validationError?.t).toEqual('name-cannot-be-empty')
  })

  test('should clear validation error after input of non empty name', async () => {
    const f = await Fixture()
    const model = f.update(f.initial, [
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
    expect(model.editPackName_validationError).toEqual(null)
  })

  test('should optimistically update pack name', async () => {
    const f = await Fixture()
    const newPackName = 'pack'
    f.update(f.initial, [
      {
        t: 'edit-pack-name.user-inputted-draft-name',
        userId: f.hostId,
        packNameDraft: newPackName,
      },
      {
        t: 'edit-pack-name.user-submitted-form',
        userId: f.hostId,
      },
    ])
  })

  test('should open edit name drawer', async () => {
    const f = await Fixture()
    const output = f.update(f.initial, [
      {
        t: 'edit-pack-name.user-clicked-open-drawer-button',
        userId: f.hostId,
      },
    ])

    expect(output.opened).toEqual('edit-pack-name-drawer')
  })

  test('should close edit name drawer', async () => {
    const f = await Fixture()
    const output = f.update(f.initial, [
      {
        t: 'edit-pack-name.user-clicked-open-drawer-button',
        userId: f.hostId,
      },
      {
        t: 'edit-pack-name.user-closed-drawer',
        userId: f.hostId,
      },
    ])
    expect(output.opened).toEqual(null)
  })
})
