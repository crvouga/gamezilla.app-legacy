import { describe, expect, it, test } from 'bun:test'
import { withEventMeta } from '~/@/event-sourced/event'

import { Pack } from '../../@/pack/pack'
import { FixturePlayFrontend } from '../@/frontend/fixture'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'

const Fixture = async () => {
  const f = await FixturePlayFrontend()
  return {
    ...f,
  }
}

describe('Test', () => {
  it('should render exit button', async () => {
    const f = await Fixture()
    const rendered = f.render(f.initial)
    expect(rendered.getByRole('button', f.ctx.t('app.exit'))).toBeTruthy()
  })

  it('should render select pack screen', async () => {
    const f = await Fixture()
    const r = f.render(f.initial)
    expect(r.getByRole('heading', f.ctx.t('game.numberlink.select-a-pack'))).toBeTruthy()
  })

  it('should show pack screen after opening pack', async () => {
    const f = await Fixture()
    const pack = await Pack.random()
    const updated = f.update(f.initial, [
      { msg: { t: 'got-msg-space', c: { t: 'user-clicked-open-pack-puzzle-grid-item', pack, userId: f.hostId } } },
    ])
    const r = f.render(updated)
    expect(r.getByRole('heading', pack.name)).toBeTruthy()
  })

  it('should make a sound when opening a pack', async () => {
    const f = await Fixture()
    const pack = await Pack.random()
    const updated = f.update(f.initial, [
      {
        msgSpace: withEventMeta({
          t: 'user-clicked-open-pack-puzzle-grid-item',
          pack,
          userId: f.hostId,
        }),
      },
    ])
    expect(PlaySoundCmd.did(updated)).toBe(true)
  })

  it.todo('should render all packs', async () => {})

  test('sound on exit play mode ', async () => {
    const f = await Fixture()

    const output = f.update(f.initial, [
      {
        msgSpace: withEventMeta({
          t: 'user-clicked-exit-play-mode-button',
          userId: f.ctx.currentUser.userId,
        }),
      },
    ])

    expect(PlaySoundCmd.did(output)).toBe(true)
  })
})
