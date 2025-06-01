import { describe, expect, it } from 'bun:test'
import { withEventMeta } from '~/@/event-sourced/event'

import { Pack } from '../../@/pack/pack'
import { Puzzle } from '../../@/puzzle/puzzle'
import { FixturePlayFrontend } from '../@/frontend/fixture'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd'
import { Sub } from '~/@/sub'

const Fixture = async () => {
  const f = await FixturePlayFrontend()
  const puzzle = await Puzzle.random()
  const pack = await Pack.random({
    puzzleIds: [puzzle.id],
  })
  const initial = f.update(f.initial, [
    { msg: { t: 'got-msg-space', c: { userId: f.hostId, t: 'user-clicked-open-pack-puzzle-grid-item', pack } } },
  ])
  return {
    ...f,
    initial,
    pack,
    puzzle,
  }
}

describe(import.meta.file, () => {
  it('should render exit button', async () => {
    const f = await Fixture()
    const rendered = f.render(f.initial)
    expect(rendered.getByRole('button', f.ctx.t('app.exit'))).toBeTruthy()
  })

  it('should render pack grid', async () => {
    const f = await Fixture()
    const rendered = f.render(f.initial)
    expect(rendered.getByRole('grid')).toBeTruthy()
  })

  it('should emit msg from clicking exit button', async () => {
    const f = await Fixture()
    const r = f.render(f.initial)
    const exitButton = r.getByRole('button', f.ctx.t('app.exit'))[0]
    exitButton?.click()
    const msg = await Sub.once(r.msgs)
    expect(msg).toEqual({ t: 'got-msg-space', c: { userId: f.hostId, t: 'user-clicked-exit-screen-open-pack' } })
  })

  it('should exit to pack list on exit button pack click', async () => {
    const f = await Fixture()
    const output = f.update(f.initial, [
      {
        msg: {
          t: 'got-msg-space',
          c: {
            userId: f.hostId,
            t: 'user-clicked-exit-screen-open-pack',
          },
        },
      },
    ])
    expect(output.modelSpace.screen.t).toBe('screen-select-pack')
  })

  it('should play nav back sound on exit', async () => {
    const f = await Fixture()
    const output = f.update(f.initial, [
      { msgSpace: withEventMeta({ t: 'user-clicked-exit-screen-open-pack', userId: f.hostId }) },
    ])
    expect(PlaySoundCmd.did(output)).toBe(true)
  })

  it('should open puzzle after clicking grid item', async () => {
    const f = await Fixture()
    const output = f.update(f.initial, [
      {
        msg: {
          t: 'got-msg-space',
          c: {
            t: 'user-clicked-open-screen-play-puzzle',
            puzzle: { t: 'got', c: f.puzzle },
            userId: f.hostId,
            puzzleIndex: 0,
          },
        },
      },
    ])
    expect(output.modelSpace.screen.t).toBe('screen-play-puzzle')
    expect(
      output.modelSpace.screen.t === 'screen-play-puzzle' && output.modelSpace.screen.puzzleResult.t === 'got',
    ).toBe(true)
    if (output.modelSpace.screen.t === 'screen-play-puzzle' && output.modelSpace.screen.puzzleResult.t === 'got') {
      expect(output.modelSpace.screen.puzzleResult.c).toEqual(f.puzzle)
    }
  })

  it('should play sound after user opens puzzle', async () => {
    const f = await Fixture()
    const output = f.update(f.initial, [
      {
        msgSpace: withEventMeta({
          t: 'user-clicked-open-screen-play-puzzle',
          puzzle: { t: 'got', c: f.puzzle },
          puzzleIndex: 0,
          userId: f.hostId,
        }),
      },
    ])
    expect(PlaySoundCmd.did(output)).toBe(true)
  })
})
