import { describe, expect, it, test } from 'bun:test'
import { didPlaySound } from 'gamezilla-app/app/@/client'
import { withEventMeta } from 'gamezilla-app/app/spaces/@/event'
import { Flow } from '../../@/flow'
import { FixtureScreenPlayPuzzleClient } from './@/fixture.client'

const Fixture = async () => {
  const f = await FixtureScreenPlayPuzzleClient()
  return {
    ...f
  }
}

describe(import.meta.file, () => {
  it('should render puzzle screen after opening puzzle from pack', async () => {
    const f = await Fixture()
    const r = f.render(f.initial)
    expect(r.getAttribute('data-puzzle-id')).toBe(f.puzzle.id)
  })

  it('should render exit button for puzzle screen', async () => {
    const f = await Fixture()
    expect(f.render(f.initial).getByRole('button', f.ctx.t('app.exit'))).toBeTruthy()
  })

  it('should make a sound after clicking exit button', async () => {
    const f = await Fixture()
    const updated = f.update(f.initial, [
      {
        msgCore: withEventMeta({
          t: 'user-clicked-exit-puzzle'
        })
      }
    ])
    expect(didPlaySound(updated)).toBe(true)
  })

  it('should exit to pack after clicking exit puzzle button', async () => {
    const f = await Fixture()
    const updated = f.update(f.initial, [
      {
        msg: {
          t: 'user-clicked-exit-puzzle'
        }
      }
    ])
    expect(updated.modelCore.screen.t).toBe('screen-select-puzzle')
  })

  it('should render next puzzle button only when puzzle is completed', async () => {
    const f = await Fixture()
    const output = f.update(f.initial, [...f.completePuzzleMsgs])
    const before = f.render(f.initial).getByRole('button', f.ctx.t('app.next'))
    const after = f.render(output).getByRole('button', f.ctx.t('app.next'))

    expect(before).toBeFalsy()
    expect(after).toBeTruthy()
  })

  it('should dispatch msg after clicking next puzzle button', async () => {
    const f = await Fixture()
    const output = f.update(f.initial, [...f.completePuzzleMsgs])
    const r = f.render(output)
    const nextButton = r.getByRole('button', f.ctx.t('app.next'))
    nextButton?.click()
    const msg = await r.msgs.once()
    expect(msg.t).toBe('user-clicked-next-puzzle')
  })

  it('should render next puzzle after clicking next puzzle button', async () => {
    const f = await Fixture()
    const updated = f.update(f.initial, [
      {
        msg: {
          t: 'user-clicked-next-puzzle',
          nextPuzzle: f.nextPuzzle,
          nextPuzzleIndex: f.nextPuzzleIndex
        }
      }
    ])
    const r = f.render(updated)
    expect(r.getAttribute('data-puzzle-id')).toBe(f.nextPuzzle.id)
  })

  it('should play sound after user clicks next puzzle button', async () => {
    const f = await Fixture()
    const output = f.update(f.initial, [
      {
        msgCore: withEventMeta({
          t: 'user-clicked-next-puzzle',
          nextPuzzle: f.nextPuzzle,
          nextPuzzleIndex: f.nextPuzzleIndex
        })
      }
    ])
    expect(didPlaySound(output)).toBe(true)
  })

  it('should render prev puzzle button', async () => {
    const f = await Fixture()
    expect(f.render(f.initial).getByRole('button', f.ctx.t('app.prev'))).toBeTruthy()
  })

  it('should play sound after user clicks prev puzzle button', async () => {
    const f = await Fixture()
    const output = f.update(f.initial, [
      {
        msgCore: withEventMeta({
          t: 'user-clicked-prev-puzzle',
          prevPuzzle: f.prevPuzzle,
          prevPuzzleIndex: f.prevPuzzleIndex
        })
      }
    ])
    expect(didPlaySound(output)).toBe(true)
  })

  it('should render prev puzzle after clicking prev puzzle button', async () => {
    const f = await Fixture()
    const updated = f.update(f.initial, [
      {
        msg: {
          t: 'user-clicked-prev-puzzle',
          prevPuzzle: f.prevPuzzle,
          prevPuzzleIndex: f.prevPuzzleIndex
        }
      }
    ])
    const r = f.render(updated)
    expect(r.getAttribute('data-puzzle-id')).toBe(f.prevPuzzle.id)
  })

  it('should emit msg after clicking prev puzzle button', async () => {
    const f = await Fixture()
    const rendered = f.render(f.initial)
    const prevButton = rendered.getByRole('button', f.ctx.t('app.prev'))
    prevButton?.click()
    const msg = await rendered.msgs.once()
    expect(msg.t).toBe('user-clicked-prev-puzzle')
  })

  it('should disable prev puzzle button when on first puzzle', async () => {
    const f = await Fixture()
    const output = f.update(f.initial, [
      {
        msg: {
          t: 'user-clicked-prev-puzzle',
          prevPuzzle: f.prevPuzzle,
          prevPuzzleIndex: f.prevPuzzleIndex
        }
      }
    ])
    const r = f.render(output)
    const prevButton = r.getByRole('button', f.ctx.t('app.prev'))
    expect(prevButton?.disabled).toBe(true)
  })

  it('should disabled next button when on last puzzle', async () => {
    const f = await Fixture()
    const output = f.update(f.initial, [
      {
        msg: {
          t: 'user-clicked-next-puzzle',
          nextPuzzle: f.nextPuzzle,
          nextPuzzleIndex: f.nextPuzzleIndex
        }
      },
      ...f.completePuzzleMsgs
    ])
    const nextButton = f.render(output).getByRole('button', f.ctx.t('app.next'))
    expect(nextButton?.disabled).toBe(true)
  })

  it('should render which level of the pack is being played', async () => {
    const f = await Fixture()
    const r = f.render(f.initial)
    expect(r.getByRole('heading', `Level ${f.puzzleIndex + 1}`)).toBeTruthy()
  })

  it('should render puzzle complete dialog after completing a puzzle', async () => {
    const f = await Fixture()
    const output = f.update(f.initial, f.completePuzzleMsgs)
    const r = f.render(output)
    expect(r.getByRole('dialog')?.getByRole('heading', f.ctx.t('flow.puzzle-completed'))).toBeTruthy()
  })

  it('should render next puzzle button in completion dialog', async () => {
    const f = await Fixture()
    const output = f.update(f.initial, f.completePuzzleMsgs)
    const r = f.render(output)
    expect(r.getByRole('dialog')?.getByRole('button', f.ctx.t('flow.next-puzzle'))).toBeTruthy()
  })

  it('should play sound after completing a puzzle', async () => {
    const f = await Fixture()
    const output = f.update(f.initial, f.completePuzzleMsgs)
    expect(didPlaySound(output)).toBe(true)
  })

  it('should play sound pressing down on a terminal', async () => {
    const f = await Fixture()
    const terminal = Flow.randomTerminal(f.puzzle.flow)

    if (!terminal) {
      expect(terminal).not.toBe(null)
      return
    }

    const output = f.update(f.initial, [
      {
        msgCore: withEventMeta({
          t: 'flow-variant-play',
          c: {
            t: 'user-pressed-down-node',
            nodeId: terminal.startId
          }
        })
      }
    ])
    expect(didPlaySound(output)).toBe(true)
  })

  it('should play sound after solving puzzle', async () => {
    const f = await Fixture()
    const output = f.update(f.initial, f.completePuzzleMsgs)
    expect(didPlaySound(output)).toBe(true)
  })

  test('reset button render', async () => {
    const f = await Fixture()
    expect(f.render(f.initial).getByRole('button', f.ctx.t('app.reset'))).toBeTruthy()
  })

  test('reset button msg dispatch', async () => {
    const f = await Fixture()
    const r = f.render(f.initial)
    const btn = r.getByRole('button', f.ctx.t('app.reset'))
    btn?.click()
    const msg = await r.msgs.once()
    expect(msg.t).toBe('user-clicked-reset-puzzle')
  })

  test('reset button sound', async () => {
    const f = await Fixture()
    const output = f.update(f.initial, [
      {
        msgCore: withEventMeta({
          t: 'user-clicked-reset-puzzle'
        })
      }
    ])
    expect(didPlaySound(output)).toBe(true)
  })

  test('hint button render', async () => {
    const f = await Fixture()
    expect(f.render(f.initial).getByRole('button', f.ctx.t('game.hint'))).toBeTruthy()
  })

  test('hint button click', async () => {
    const f = await Fixture()
    const r = f.render(f.initial)
    const btn = r.getByRole('button', f.ctx.t('game.hint'))
    btn?.click()
    const msg = await r.msgs.once()
    expect(msg.t).toBe('flow-variant-play')
  })

  test('hint button sound', async () => {
    const f = await Fixture()
    const output = f.update(f.initial, [
      {
        msgCore: withEventMeta({
          t: 'user-clicked-hint'
        })
      }
    ])
    expect(didPlaySound(output)).toBe(true)
  })

  test('not render hint button when puzzle is solved', async () => {
    const f = await Fixture()
    const output = f.update(f.initial, [...f.completePuzzleMsgs])
    const r = f.render(output)
    const btn = r.getByRole('button', f.ctx.t('game.hint'))
    expect(btn).toBeFalsy()
  })

  test('close puzzle complete dialog sound', async () => {
    const f = await Fixture()
    const output = f.update(f.initial, [
      ...f.completePuzzleMsgs,
      {
        msgCore: withEventMeta({
          t: 'user-closed-puzzle-complete-dialog'
        })
      }
    ])
    expect(didPlaySound(output)).toBe(true)
  })

  test('toggle action drawer sound', async () => {
    const f = await Fixture()
    const output = f.update(f.initial, [
      {
        msgCore: withEventMeta({
          t: 'user-toggled-action-buttons-drawer'
        })
      }
    ])
    expect(didPlaySound(output)).toBe(true)
  })
})
