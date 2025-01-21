import { describe, expect, it, test } from 'bun:test'
import { withEventMeta } from '~/@/event-sourced/event'
import { didPlaySound } from '~/app/@/frontend/cmd'
import { Pack } from '../../@/pack/pack'
import { Puzzle } from '../../@/puzzle/puzzle'
import { FixturePlayFrontend } from '../@/frontend/fixture'

const Fixture = async () => {
  const f = await FixturePlayFrontend()
  const puzzle = await Puzzle.random()
  const pack = await Pack.random({
    puzzleIds: [puzzle.id],
  })
  const initial = f.update(f.initial, [
    { msg: { t: 'got-msg-space', c: { t: 'user-clicked-open-pack-list-item', pack } } },
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
    const exitButton = r.getByRole('button', f.ctx.t('app.exit'))
    exitButton?.click()
    const msg = await r.msgs.once()
    expect(msg).toEqual({ t: 'got-msg-space', c: { t: 'user-clicked-exit-pack-button' } })
  })

  it('should exit to pack list on exit button pack click', async () => {
    const f = await Fixture()
    const output = f.update(f.initial, [
      {
        msg: { t: 'got-msg-space', c: { t: 'user-clicked-exit-pack-button' } },
      },
    ])
    expect(output.modelSpace.screen.t).toBe('screen-select-pack')
  })

  it('should play nav back sound on exit', async () => {
    const f = await Fixture()
    const output = f.update(f.initial, [{ msgSpace: withEventMeta({ t: 'user-clicked-exit-pack-button' }) }])
    expect(didPlaySound(output)).toBe(true)
  })

  it('should open puzzle after clicking grid item', async () => {
    const f = await Fixture()
    const output = f.update(f.initial, [
      {
        msg: {
          t: 'got-msg-space',
          c: {
            t: 'user-clicked-open-puzzle-grid-item',
            flowPuzzle: { t: 'got', c: f.puzzle },
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
          t: 'user-clicked-open-puzzle-grid-item',
          flowPuzzle: { t: 'got', c: f.puzzle },
          puzzleIndex: 0,
        }),
      },
    ])
    expect(didPlaySound(output)).toBe(true)
  })

  test('load puzzles for pack after user opens pack', async () => {
    const f = await Fixture()
    const output = f.update(f.initial, [
      {
        msgSpace: withEventMeta({
          t: 'user-clicked-open-pack-list-item',
          pack: f.pack,
        }),
      },
    ])

    expect(output.msgCmd?.some((m) => m.t === 'pack-puzzles-grid' && m.c.t === 'load')).toBe(true)
  })
})
