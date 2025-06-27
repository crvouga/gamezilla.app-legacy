// import { describe, expect, test } from 'bun:test'
// import { FixtureSpacesFrontend } from '~/app/spaces/@/fixture/frontend'
// import { NumberlinkVariantBoard } from '.'
// import { BoardInput } from '../ui/board'
// import { VariantGridShorthand } from './grid'
// import type * as FlowVariant from './variant'

// const Fixture = async () => {
//   const f = await FixtureSpacesFrontend()
//   const numberlink = VariantGridShorthand.toGrid([
//     ['A', ' '],
//     [' ', 'A'],
//   ])
//   const input: BoardInput<FlowVariant.Model> = {
//     model: numberlink,
//   }
//   const render = (input: BoardInput<FlowVariant.Model>) => {
//     return f.render(<NumberlinkVariantBoard.View {...input} />)
//   }
//   return {
//     ...f,
//     render,
//     input,
//   }
// }
// describe('Test', () => {
//   test('render hint checkmark', async () => {
//     const f = await Fixture()
//     f.render(f.input)
//     expect(true).toBe(true)
//   })
// })
