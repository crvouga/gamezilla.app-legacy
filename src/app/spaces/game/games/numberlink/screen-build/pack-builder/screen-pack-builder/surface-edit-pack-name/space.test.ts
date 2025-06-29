import { describe, expect, it } from 'vitest'
import { ScreenPackBuildSpaceFixture } from '../@/fixture/space'

const Fixture = async () => {
  const f = await ScreenPackBuildSpaceFixture()
  return {
    ...f,
  }
}

describe('Test', () => {
  it('should let host input pack name', async () => {
    const f = await Fixture()
    const packNameDraft = 'pack-name'
    const model = f.update(f.initial, [
      {
        t: 'edit-pack-name.user-inputted-draft-name',
        userId: f.hostId,
        packNameDraft,
      },
    ])
    expect(model.editPackName_draft).toBe(packNameDraft)
  })

  it('should only allow host to input pack name', async () => {
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
    expect(after).toBe(before)
  })

  it('should be loading after saving pack name', async () => {
    const f = await Fixture()
    const model = f.update(f.initial, [
      {
        t: 'edit-pack-name.user-submitted-form',
        userId: f.hostId,
      },
    ])
    expect(model.editPackName_result.t).toBe('loading')
  })

  it('should error if name is empty', async () => {
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
    expect(model.editPackName_validationError?.t).toBe('name-cannot-be-empty')
  })

  it('should clear validation error after input of non empty name', async () => {
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
    expect(model.editPackName_validationError).toBe(null)
  })

  it('should optimistically update pack name', async () => {
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

  it('should open edit name drawer', async () => {
    const f = await Fixture()
    const output = f.update(f.initial, [
      {
        t: 'edit-pack-name.user-clicked-open-drawer-button',
        userId: f.hostId,
      },
    ])

    expect(output.opened).toBe('edit-pack-name-drawer')
  })

  it('should close edit name drawer', async () => {
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
    expect(output.opened).toBe(null)
  })
})
