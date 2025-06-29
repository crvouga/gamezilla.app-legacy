// import { describe, test } from 'vitest'
// import { FixtureAppFrontend } from '~/app/@/frontend/fixture'
// import { ModeEdit } from '.'
// import { NumberlinkVariant } from '../variant'
// import { VariantGridShorthand } from '../variant/grid'
// import { ModeEditFrontend } from './frontend'

// type Output = ReturnType<typeof ModeEdit.update>

// const Fixture = async (input?: { numberlink?: NumberlinkVariant.Model }) => {
//   const f = await FixtureAppFrontend()
//   const numberlink =
//     input?.numberlink ??
//     VariantGridShorthand.toGrid([
//       ['A', ' '],
//       [' ', 'A'],
//     ])

//   const init: Output = {
//     model: ModeEdit.init({ numberlink }),
//   }

//   const update = (acc: Output, [msg, ...msgs]: ModeEdit.Msg[]): Output => {
//     if (!msg) return acc
//     const updated = ModeEdit.update({ numberlink, model: acc.model, msg })
//     return update(updated, msgs)
//   }

//   const render = (input: Partial<Parameters<typeof ModeEditFrontend.View>[0]>) => {
//     const r = f.render(
//       <ModeEditFrontend.View
//         ctx={f.ctx}
//         model={init.model}
//         dispatch={() => {}}
//         screenLayout={{ parentScreen: f.ctx.parentScreen }}
//         {...input}
//       />,
//     )

//     return r
//   }

//   return {
//     numberlink,
//     init,
//     update,
//     render,
//   }
// }

// describe('ModeEditFrontend', () => {
//   test.todo('render ghost terminal', async () => {
//     const f = await Fixture()
//     f
//   })
// })
