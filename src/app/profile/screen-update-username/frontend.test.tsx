// import { describe, expect, test } from 'vitest'
// import { FixtureAppFrontend } from '~/app/@/frontend/fixture'
// import { ScreenUpdateUsernameFrontend } from './frontend'
// import { ModelFrontend, MsgFrontend } from './types'
// import { Sub } from '~/@/sub'

// const Fixture = async () => {
//   const f = await FixtureAppFrontend()

//   const render = (model: ModelFrontend) => {
//     const msgs = Sub.create<MsgFrontend>()
//     return {
//       ...f.render(<ScreenUpdateUsernameFrontend.View ctx={f.ctx} model={model} dispatch={msgs.pub} />),
//       msgs,
//     }
//   }

//   const initial = ScreenUpdateUsernameFrontend.init({ ...f }).model

//   return {
//     ...f,
//     render,
//     initial,
//   }
// }

// describe('Test', () => {
//   test('render username input', async () => {
//     const f = await Fixture()
//     const r = f.render(f.initial)
//     const textbox = r.getByRole('textbox', f.ctx.t('username.username-label'))
//     expect(textbox).toBeTruthy()
//     // textbox?.input('new-username')
//     // const msg = await r.msgs.once()
//     // expect(msg.t).toBe('inputted-username')
//   })

//   test('render save button', async () => {
//     const f = await Fixture()
//     const r = f.render(f.initial)
//     const button = r.getByRole('button', f.ctx.t('app.save'))[0]
//     expect(button).toBeTruthy()
//     button?.click()
//     const msg = await Sub.take(r.msgs)
//     expect(msg.t).toBe('profile.update-username.clicked-save')
//   })

//   test('render exit button', async () => {
//     const f = await Fixture()
//     const r = f.render(f.initial)
//     const button = r.getByRole('button', f.ctx.t('app.exit'))[0]
//     expect(button).toBeTruthy()
//   })
// })
