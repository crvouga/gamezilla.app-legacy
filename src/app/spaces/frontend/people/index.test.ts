import { describe, expect, it, test } from 'bun:test'
import { didOpenProfile, didPlaySound } from '~/app/@/frontend/cmd'
import { UserId } from '~/app/@/data/user-id'
import { People } from '.'
import { FixtureSpacesFrontend } from '../../@/fixture/frontend'
import { openUserDetails } from '~/app/spaces/@/space-frontend/cmd'

const Fixture = async () => {
  const f = await FixtureSpacesFrontend()
  return {
    ...f,
  }
}

describe(import.meta.file, () => {
  it('should start with no modals open', async () => {
    const f = await Fixture()
    const output = f.update(f.initial, [])
    expect(output.model.modal === null).toBe(true)
  })

  it('should open users modal when user clicks on users button', async () => {
    const f = await Fixture()
    const output = f.update(f.initial, [
      {
        msg: {
          t: 'clicked-people-button',
        },
      },
    ])
    expect(output.model.modal === 'users').toBe(true)
  })

  it('should open user details modal after clicking user', async () => {
    const f = await Fixture()
    const someUserId = UserId.generate()
    const output = f.update(f.initial, [
      {
        msg: {
          t: 'clicked-user',
          userId: someUserId,
        },
      },
    ])
    expect(output.model.modal === 'user-preview' && output.model.modalPreviewUserId === someUserId).toBe(true)
  })

  it('should close modal when the current screen changes', async () => {
    const f = await Fixture()
    const someUserId = UserId.generate()
    const output = f.update(f.initial, [
      {
        msg: {
          t: 'clicked-user',
          userId: someUserId,
        },
      },
      {
        msgEvt: {
          t: 'routing-evt.screen-changed',
          screen: {
            n: 'spaces',
            t: 'space-list',
          },
        },
      },
    ])
    expect(output.model.modal === null).toBe(true)
  })

  it('should open user details corresponding cmd', async () => {
    const f = await Fixture()

    const someUserId = UserId.generate()

    const output = People.update({
      model: f.initial.model,
      ctx: f.ctx,
      msgCmd: openUserDetails(someUserId),
    })

    expect(output.model.modal === 'user-preview' && output.model.modalPreviewUserId === someUserId).toBe(true)
  })

  it('should navigate to preview users profile page when clicked', async () => {
    const f = await FixtureSpacesFrontend()
    const someUserId = UserId.generate()
    const output = f.update(f.initial, [
      {
        msg: {
          t: 'clicked-user',
          userId: someUserId,
        },
      },
      {
        msg: {
          t: 'clicked-preview-user-link',
        },
      },
    ])

    expect(didOpenProfile(output, someUserId)).toBe(true)
  })

  it('should play sound when clicking preview user link', async () => {
    const f = await FixtureSpacesFrontend()
    const someUserId = UserId.generate()
    const output = f.update(f.initial, [
      {
        msg: {
          t: 'clicked-user',
          userId: someUserId,
        },
      },
      {
        msg: {
          t: 'clicked-preview-user-link',
        },
      },
    ])
    expect(output.msgCmd?.some((msgCmd) => msgCmd.t === 'sound' && msgCmd.c.t === 'play')).toBe(true)
  })

  it('should not navigate after clicking preview user link if preview is not open', async () => {
    const f = await FixtureSpacesFrontend()
    const someUserId = UserId.generate()
    const output = f.update(f.initial, [
      {
        msg: {
          t: 'clicked-preview-user-link',
        },
      },
    ])
    expect(
      output.msgCmd?.some(
        (msgCmd) => msgCmd.t === 'profile' && msgCmd.c.t === 'open-profile' && msgCmd.c.userId === someUserId,
      ),
    ).toBe(false)
  })

  test('play sound open people modal', async () => {
    const f = await FixtureSpacesFrontend()
    const output = f.update(f.initial, [
      {
        msg: {
          t: 'clicked-people-button',
        },
      },
    ])
    expect(didPlaySound(output)).toBe(true)
  })

  test('play sound close modal', async () => {
    const f = await FixtureSpacesFrontend()
    const output = f.update(f.initial, [
      {
        msg: {
          t: 'closed-modal',
        },
      },
    ])
    expect(didPlaySound(output)).toBe(true)
  })

  test('play sound open user details modal', async () => {
    const f = await FixtureSpacesFrontend()
    const someUserId = UserId.generate()
    const output = f.update(f.initial, [
      {
        msg: {
          t: 'clicked-user',
          userId: someUserId,
        },
      },
    ])
    expect(didPlaySound(output)).toBe(true)
  })
})
