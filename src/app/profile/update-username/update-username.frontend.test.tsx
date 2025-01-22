import { describe, expect, test } from 'bun:test'
import { FixtureAppFrontend } from '~/app/@/frontend/fixture'
import { init, View } from './update-username.frontend'
import { ModelFrontend, MsgFrontend } from './update-username.types'
import { PubSub } from '~/@/sub'

const Fixture = async () => {
  const f = await FixtureAppFrontend()

  const render = (model: ModelFrontend) => {
    const msgs = PubSub.create<MsgFrontend>()
    return {
      ...f.render(<View ctx={f.ctx} model={model} dispatch={msgs.pub} />),
      msgs,
    }
  }

  const initial = init({ ...f, model: {} }).model

  return {
    ...f,
    render,
    initial,
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
    const button = r.getByRole('button', f.ctx.t('app.save'))[0]
    expect(button).toBeTruthy()
    button?.click()
    const msg = await r.msgs.once()
    expect(msg.t).toBe('profile.update-username.clicked-save')
  })

  test('render exit button', async () => {
    const f = await Fixture()
    const r = f.render(f.initial)
    const button = r.getByRole('button', f.ctx.t('app.exit'))[0]
    expect(button).toBeTruthy()
  })
})
