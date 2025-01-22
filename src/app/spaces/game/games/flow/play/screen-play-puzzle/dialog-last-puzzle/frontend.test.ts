import { describe, expect, it } from 'bun:test'
import { withEventMeta } from '~/@/event-sourced/event'
import { didPlaySound } from '~/app/@/frontend/cmd'
import { FixtureScreenPlayPuzzleFrontend } from '../@/fixture/frontend'

const Fixture = async () => {
  const f = await FixtureScreenPlayPuzzleFrontend()
  return {
    ...f,
  }
}

describe(import.meta.file, () => {
  it('should render select next pack button in completion dialog after completing last puzzle', async () => {
    const f = await Fixture()
    const before = f.render(f.init)
    const output = f.update(f.init, f.completeLastPuzzleMsgs)
    const after = f.render(output)
    expect(before.getByRole('dialog')[0]?.getByRole('button', f.ctx.t('flow.select-next-pack'))[0]).toBeFalsy()
    expect(after.getByRole('dialog')[0]?.getByRole('button', f.ctx.t('flow.select-next-pack'))[0]).toBeTruthy()
  })

  it('should dispatch a msg after clicking select next pack button', async () => {
    const f = await Fixture()
    const output = f.update(f.init, f.completeLastPuzzleMsgs)
    const rendered = f.render(output)
    const button = rendered.getByRole('dialog')[0]?.getByRole('button', f.ctx.t('flow.select-next-pack'))[0]
    button?.click()
    const msg = await rendered.msgs.once()
    expect(msg).toEqual({ t: 'got-msg-space', c: { t: 'user-clicked-select-next-pack', userId: f.hostId } })
  })

  it('should output select next pack event', async () => {
    const f = await Fixture()
    const initial = f.update(f.init, f.completeLastPuzzleMsgs)
    const output = f.update(initial, [
      { msg: { t: 'got-msg-space', c: { t: 'user-clicked-select-next-pack', userId: f.hostId } } },
    ])
    expect(output.msgSpace?.some((m) => m.t === 'user-clicked-select-next-pack')).toBe(true)
  })

  it('should render congrats message after completing last puzzle', async () => {
    const f = await Fixture()
    const output = f.update(f.init, f.completeLastPuzzleMsgs)

    expect(f.render(output).getByRole('dialog')[0]?.getByRole('heading', f.ctx.t('app.congratulations'))).toBeTruthy()
  })

  it('should dispatch correct msg after clicking select next pack button', async () => {
    const f = await Fixture()
    const output = f.update(f.init, f.completeLastPuzzleMsgs)
    const r = f.render(output)
    const button = r.getByRole('dialog')[0]?.getByRole('button', f.ctx.t('flow.select-next-pack'))[0]
    button?.click()
    expect(button).toBeTruthy()
    const msg = await r.msgs.once()
    expect(msg).toEqual({
      t: 'got-msg-space',
      c: {
        userId: f.hostId,
        t: 'user-clicked-select-next-pack',
      },
    })
  })

  it('should play sound after clicking select next pack button', async () => {
    const f = await Fixture()
    const initial = f.update(f.init, f.completeLastPuzzleMsgs)
    const output = f.update(initial, [
      {
        msgSpace: withEventMeta({
          t: 'user-clicked-select-next-pack',
          userId: f.hostId,
        }),
      },
    ])
    expect(didPlaySound(output)).toBe(true)
  })
})
