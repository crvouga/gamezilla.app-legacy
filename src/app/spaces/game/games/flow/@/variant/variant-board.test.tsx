import { describe, expect, test } from 'bun:test'
import { FixtureSpacesFrontend } from '~/app/spaces/@/fixture/frontend'
import { VariantBoard } from '.'
import { BoardInput } from '../ui/board'
import { VariantGridShorthand } from './grid'
import type * as FlowVariant from './variant'

const Fixture = async () => {
  const f = await FixtureSpacesFrontend()
  const flow = VariantGridShorthand.toGrid([
    ['A', ' '],
    [' ', 'A'],
  ])
  const input: BoardInput<FlowVariant.Model> = {
    model: flow,
  }
  const render = (input: BoardInput<FlowVariant.Model>) => {
    return f.render(<VariantBoard.View {...input} />)
  }
  return {
    ...f,
    render,
    input,
  }
}
describe(import.meta.file, () => {
  test('render hint checkmark', async () => {
    const f = await Fixture()
    f.render(f.input)
    expect(true).toBe(true)
  })
})
