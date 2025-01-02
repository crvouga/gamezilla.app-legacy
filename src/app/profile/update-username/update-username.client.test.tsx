import { describe, expect, test } from 'bun:test'
import { FixtureAppClient } from '~/app/@/client/fixture'
import { init, View } from './update-username.client'
import { ModelClient, MsgClient } from './update-username.types'
import { PubSub } from '~/@/sub'

const Fixture = async () => {
  const f = await FixtureAppClient()

  const render = (model: ModelClient) => {
    const msgs = PubSub.create<MsgClient>()
    return {
      ...f.render(<View ctx={f.ctx} model={model} dispatch={msgs.pub} />),
      msgs
    }
  }

  const initial = init({ ...f, model: {} }).model

  return {
    ...f,
    render,
    initial
  }
}

describe(import.meta.file, () => {
  test('render username input', async () => {
    const f = await Fixture()
    const r = f.render(f.initial)
    const textbox = r.getByRole('textbox', f.ctx.t('username-title'))
    expect(textbox).toBeTruthy()
    // textbox?.input('new-username')
    // const msg = await r.msgs.once()
    // expect(msg.t).toBe('inputted-username')
  })

  test('render save button', async () => {
    const f = await Fixture()
    const r = f.render(f.initial)
    const button = r.getByRole('button', f.ctx.t('app.save'))
    expect(button).toBeTruthy()
    button?.click()
    const msg = await r.msgs.once()
    expect(msg.t).toBe('profile.update-username.clicked-save')
  })

  test('render exit button', async () => {
    const f = await Fixture()
    const r = f.render(f.initial)
    const button = r.getByRole('button', f.ctx.t('app.exit'))
    expect(button).toBeTruthy()
  })
})
