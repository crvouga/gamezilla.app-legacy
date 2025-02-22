import { describe, expect, test } from 'bun:test'
import { withEventMeta } from '~/@/event-sourced/event'
import { didPlaySound } from '~/app/@/frontend/cmd'
import { Puzzle } from '../../../../@/puzzle/puzzle'
import { FixturePackBuilderFrontend } from '../@/fixture/frontend'
import { MsgFrontend } from '../types'
import { ScreenPuzzleGrid } from './frontend'

const Fixture = async () => {
  const f = await FixturePackBuilderFrontend()
  const renderMsgs: MsgFrontend[] = []
  const dispatch = (m: MsgFrontend) => {
    renderMsgs.push(m)
  }
  return { ...f, renderMsgs, dispatch }
}
describe(import.meta.file, () => {
  test('play sound opening add puzzle screen', async () => {
    const f = await Fixture()
    const output = f.update(f.init, [
      {
        msgSpace: withEventMeta({
          t: 'screen-puzzle-grid.user-clicked-open-add-puzzle-screen-button',
          userId: f.hostId,
        }),
      },
    ])
    expect(didPlaySound(output)).toBe(true)
  })

  test('play sound opening puzzle', async () => {
    const f = await Fixture()
    const output = f.update(f.init, [
      {
        msgSpace: withEventMeta({
          t: 'screen-pack-builder.user-clicked-pack-item',
          userId: f.hostId,
          puzzleIndex: 0,
          puzzleResult: { t: 'got', c: await Puzzle.random() },
        }),
      },
    ])
    expect(didPlaySound(output)).toBe(true)
  })

  test('render bottom buttons', async () => {
    const f = await Fixture()
    const r = f.render(<ScreenPuzzleGrid.View {...f} />)
    expect(r.getByRole('toolbar').length).toBe(1)
  })
  test('render edit name button', async () => {
    const f = await Fixture()
    const r = f.render(<ScreenPuzzleGrid.View {...f} />)
    expect(r.getByRole('button', f.ctx.t('app.edit-name')).length).toBe(1)
  })
  test('open edit name drawer on click', async () => {
    const f = await Fixture()
    const r = f.render(<ScreenPuzzleGrid.View {...f} />)
    await r.getByRole('button', f.ctx.t('app.edit-name'))[0]?.click()
    const m = f.renderMsgs[0]
    expect(m?.c.t).toBe('edit-pack-name.user-clicked-open-drawer-button')
  })
})
