import { describe, expect, it, test } from 'bun:test'
import { EventId, withEventMeta } from '~/@/event-sourced/event'
import { LamportTimestamp } from '~/@/lamport-clock'
import { didPlaySound } from '~/app/@/frontend/cmd'
import { Pack } from '../../@/pack/pack'
import { PackListFrontend } from '../../@/pack/pack-list'
import { FixturePlayFrontend } from '../@/frontend/fixture'

const Fixture = async () => {
  const f = await FixturePlayFrontend()
  return {
    ...f,
  }
}

describe(import.meta.file, () => {
  it('should render exit button', async () => {
    const f = await Fixture()
    const rendered = f.render(f.initial)
    expect(rendered.getByRole('button', f.ctx.t('app.exit'))).toBeTruthy()
  })

  it('should render select pack screen', async () => {
    const f = await Fixture()
    const r = f.render(f.initial)
    expect(r.getByRole('heading', f.ctx.t('flow.play'))).toBeTruthy()
  })

  it('should show pack screen after opening pack', async () => {
    const f = await Fixture()
    const pack = await Pack.random()
    const updated = f.update(f.initial, [
      {
        msg: {
          t: 'got-msg-core',
          c: {
            t: 'user-clicked-open-pack-list-item',
            pack,
          },
        },
      },
    ])
    const r = f.render(updated)
    expect(r.getByRole('heading', pack.name)).toBeTruthy()
  })

  it('should make a sound when opening a pack', async () => {
    const f = await Fixture()
    const pack = await Pack.random()
    const updated = f.update(f.initial, [
      {
        msgCore: {
          t: 'user-clicked-open-pack-list-item',
          pack,
          eventId: EventId.generate(),
          happenedAt: LamportTimestamp.fromNumber(0),
        },
      },
    ])
    expect(didPlaySound(updated)).toBe(true)
  })

  it.todo('should render all packs', async () => {})

  test('sound on exit play mode ', async () => {
    const f = await Fixture()

    const output = f.update(f.initial, [
      {
        msgCore: withEventMeta({
          t: 'user-clicked-exit-play-mode-button',
          userId: f.ctx.currentUserId,
        }),
      },
    ])

    expect(didPlaySound(output)).toBe(true)
  })

  test('load packs on exiting select puzzle screen', async () => {
    const f = await Fixture()

    const output = f.update(f.initial, [
      {
        msgCore: withEventMeta({
          t: 'user-clicked-exit-pack-button',
          userId: f.ctx.currentUserId,
        }),
      },
    ])

    expect(PackListFrontend.didLoad(output)).toBe(true)
  })

  test('load packs on clicking select new pack', async () => {
    const f = await Fixture()

    const output = f.update(f.initial, [
      {
        msgCore: withEventMeta({
          t: 'user-clicked-select-next-pack',
          userId: f.ctx.currentUserId,
        }),
      },
    ])

    expect(PackListFrontend.didLoad(output)).toBe(true)
  })
})
