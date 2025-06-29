import { describe, expect, test } from 'vitest'
import { Logger } from '~/@/logger'
import { ModePlay } from '.'
import { Numberlink } from '../numberlink'
import { AlgoIsSolved } from '../solutions/algo-is-solved/algo-is-solved'
import { Solutions } from '../solutions/solutions'
import type { NumberlinkVariant } from '../variant'
import { VariantGrid } from '../variant/grid'
import { VariantGridShorthand } from '../variant/grid/grid-shorthand'
import { toStatus } from './mode-play'

const Fixture = async (input: { numberlink: NumberlinkVariant.Model }) => {
  const ctx: ModePlay.Ctx = ModePlay.initCtx({
    solutions: await Solutions.find({ models: [input.numberlink], logger: Logger({ t: 'noop' }) }),
    numberlink: input.numberlink,
  })

  const init = ModePlay.init({ ctx })

  const update = (init: ModePlay.Model, msgs: ModePlay.Msg[]) => {
    return msgs.reduce<ReturnType<typeof ModePlay.update>>(
      (output, msg) => ModePlay.update({ ctx, model: output.model, msg }),
      { model: init },
    )
  }

  const solutionMsgs = ModePlay.toSolutionMsgs({
    numberlink: input.numberlink,
  })

  return {
    numberlink: input.numberlink,
    init,
    update,
    solutionMsgs,
  }
}

describe('NumberlinkModePlay', () => {
  test('to solution msgs', async () => {
    const numberlink = VariantGridShorthand.toGrid([
      ['A', ' ', ' '],
      [' ', 'B', ' '],
      [' ', ' ', 'A'],
    ])

    const f = await Fixture({
      numberlink: numberlink,
    })

    const msgs = ModePlay.toSolutionMsgs({
      numberlink: numberlink,
    })

    const before = ModePlay.toNumberlink(f.init, f.numberlink)

    const after = ModePlay.toNumberlink(f.update(f.init, msgs).model, f.numberlink)

    expect(AlgoIsSolved.isSolved(before)).toBe(false)
    expect(AlgoIsSolved.isSolved(after)).toBe(true)
  })

  test('should output connected terminals event', async () => {
    const numberlink = VariantGridShorthand.toGrid([
      ['A', ' ', 'B'],
      ['a', 'B', ' '],
      ['a', ' ', 'A'],
    ])
    const f = await Fixture({
      numberlink: numberlink,
    })

    const output = f.update(f.init, [
      {
        t: 'user-pressed-down-node',
        nodeId: VariantGrid.toNodeId({
          x: 0,
          y: 2,
        }),
      },
      {
        t: 'user-dragged-over-node',
        nodeId: VariantGrid.toNodeId({
          x: 1,
          y: 2,
        }),
      },
      {
        t: 'user-dragged-over-node',
        nodeId: VariantGrid.toNodeId({
          x: 2,
          y: 2,
        }),
      },
      {
        t: 'user-pressed-up-node',
        nodeId: VariantGrid.toNodeId({
          x: 2,
          y: 2,
        }),
      },
    ])

    expect(output.events?.some((e) => e.t === 'connected-terminals')).toBe(true)
  })

  test('should output started dragging event', async () => {
    const numberlink = VariantGridShorthand.toGrid([
      ['A', ' ', ' '],
      ['a', 'B', ' '],
      ['a', ' ', 'A'],
    ])
    const f = await Fixture({
      numberlink: numberlink,
    })

    const output = f.update(f.init, [
      {
        t: 'user-pressed-down-node',
        nodeId: VariantGrid.toNodeId({
          x: 0,
          y: 2,
        }),
      },
    ])

    expect(output.events?.some((e) => e.t === 'started-dragging')).toBe(true)
  })

  test('should output solved event', async () => {
    const numberlink = VariantGridShorthand.toGrid([
      ['A', ' ', ' '],
      ['a', 'B', ' '],
      ['a', ' ', 'A'],
    ])
    const f = await Fixture({
      numberlink: numberlink,
    })

    const output = f.update(f.init, [
      {
        t: 'user-pressed-down-node',
        nodeId: VariantGrid.toNodeId({
          x: 0,
          y: 2,
        }),
      },
      {
        t: 'user-dragged-over-node',
        nodeId: VariantGrid.toNodeId({
          x: 1,
          y: 2,
        }),
      },
      {
        t: 'user-dragged-over-node',
        nodeId: VariantGrid.toNodeId({
          x: 2,
          y: 2,
        }),
      },
      {
        t: 'user-pressed-up-node',
        nodeId: VariantGrid.toNodeId({
          x: 2,
          y: 2,
        }),
      },
    ])

    expect(output.events?.some((e) => e.t === 'solved')).toBe(true)
  })

  test('should output solved event even after dragging left the board', async () => {
    const numberlink = VariantGridShorthand.toGrid([
      ['A', ' ', ' '],
      ['a', 'B', ' '],
      ['a', ' ', 'A'],
    ])
    const f = await Fixture({
      numberlink: numberlink,
    })

    const output = f.update(f.init, [
      {
        t: 'user-pressed-down-node',
        nodeId: VariantGrid.toNodeId({
          x: 0,
          y: 2,
        }),
      },
      {
        t: 'user-dragged-over-node',
        nodeId: VariantGrid.toNodeId({
          x: 1,
          y: 2,
        }),
      },
      {
        t: 'user-dragged-over-node',
        nodeId: VariantGrid.toNodeId({
          x: 2,
          y: 2,
        }),
      },
      {
        t: 'user-dragging-left',
      },
    ])
    expect(output.events?.some((e) => e.t === 'solved')).toBe(true)
  })

  test('should not output solved event after dragging left the board if not connected', async () => {
    const numberlink = VariantGridShorthand.toGrid([
      ['A', ' ', ' '],
      ['a', 'B', ' '],
      ['a', ' ', 'A'],
    ])
    const f = await Fixture({
      numberlink: numberlink,
    })

    const output = f.update(f.init, [
      {
        t: 'user-pressed-down-node',
        nodeId: VariantGrid.toNodeId({
          x: 0,
          y: 2,
        }),
      },
      {
        t: 'user-dragged-over-node',
        nodeId: VariantGrid.toNodeId({
          x: 1,
          y: 2,
        }),
      },
      {
        t: 'user-dragging-left',
      },
    ])
    expect(output.events?.every((e) => e.t !== 'solved')).toBe(true)
  })

  test('should not output solved if not pressed up on terminal', async () => {
    const numberlink = VariantGridShorthand.toGrid([
      ['A', ' ', ' '],
      ['a', 'B', ' '],
      ['a', ' ', 'A'],
    ])
    const f = await Fixture({
      numberlink: numberlink,
    })

    const output = f.update(f.init, [
      {
        t: 'user-pressed-down-node',
        nodeId: VariantGrid.toNodeId({
          x: 0,
          y: 2,
        }),
      },
      {
        t: 'user-dragged-over-node',
        nodeId: VariantGrid.toNodeId({
          x: 1,
          y: 2,
        }),
      },
      {
        t: 'user-dragged-over-node',
        nodeId: VariantGrid.toNodeId({
          x: 2,
          y: 2,
        }),
      },
    ])

    expect(output.events?.every((e) => e.t !== 'solved')).toBe(true)
  })

  test('should not output solved event if terminals are not connected', async () => {
    const numberlink = VariantGridShorthand.toGrid([
      ['A', ' ', ' '],
      ['a', 'B', ' '],
      ['a', 'a', 'A'],
    ])

    const f = await Fixture({
      numberlink: numberlink,
    })

    const output = f.update(f.init, [
      { t: 'user-pressed-down-node', nodeId: VariantGrid.toNodeId({ x: 1, y: 1 }) },
      { t: 'user-dragged-over-node', nodeId: VariantGrid.toNodeId({ x: 1, y: 0 }) },
      { t: 'user-pressed-up-node', nodeId: VariantGrid.toNodeId({ x: 1, y: 0 }) },
    ])

    expect(output.events?.every((e) => e.t !== 'solved')).toBe(true)
  })

  test('hint', async () => {
    const numberlink = VariantGridShorthand.toGrid([
      ['A', ' '],
      [' ', 'A'],
    ])
    const f = await Fixture({
      numberlink: numberlink,
    })

    const msgs: ModePlay.Msg[] = [
      { t: 'user-pressed-down-node', nodeId: VariantGrid.toNodeId({ x: 1, y: 1 }) },
      { t: 'user-dragged-over-node', nodeId: VariantGrid.toNodeId({ x: 1, y: 0 }) },
      { t: 'user-pressed-up-node', nodeId: VariantGrid.toNodeId({ x: 1, y: 0 }) },
    ]

    const output = f.update(f.init, msgs)

    expect(output.events?.every((e) => e.t !== 'solved')).toBe(true)
  })

  test('derive numberlink with hints', async () => {
    const numberlink = VariantGridShorthand.toGrid([
      ['A', ' '],
      [' ', 'A'],
    ])
    const f = await Fixture({
      numberlink: numberlink,
    })

    const model = f.update(f.init, [
      {
        t: 'user-clicked-use-hint',
        solutions: await Solutions.find({ models: [numberlink], logger: Logger({ t: 'noop' }) }),
      },
    ]).model

    const numberlinkNew = ModePlay.toNumberlink(model, numberlink)

    expect(AlgoIsSolved.isSolved(numberlinkNew)).toBe(true)
  })

  test('should not output solved event when drawing from incomplete terminal and then leave drawing', async () => {
    const numberlink = VariantGridShorthand.toGrid([
      ['B', ' ', 'A'],
      [' ', ' ', 'a'],
      [' ', ' ', 'A'],
    ])
    const f = await Fixture({
      numberlink: numberlink,
    })

    const msgs: ModePlay.Msg[] = [
      {
        t: 'user-pressed-down-node',
        nodeId: VariantGrid.toNodeId({
          x: 0,
          y: 0,
        }),
      },
      {
        t: 'user-dragged-over-node',
        nodeId: VariantGrid.toNodeId({
          x: 0,
          y: 1,
        }),
      },
      {
        t: 'user-dragged-over-node',
        nodeId: VariantGrid.toNodeId({
          x: 0,
          y: 2,
        }),
      },
      {
        t: 'user-dragging-left',
      },
    ]

    const output = f.update(f.init, msgs)

    expect(output.events?.every((e) => e.t !== 'solved')).toBe(true)
  })

  test('reset pipes', async () => {
    const f = await Fixture({
      numberlink: VariantGridShorthand.toGrid([
        ['A', ' ', ' '],
        ['a', ' ', ' '],
        ['a', 'a', 'A'],
      ]),
    })

    const output = f.update(f.init, [
      {
        t: 'user-clicked-reset',
      },
    ])

    const before = ModePlay.toNumberlink(f.init, f.numberlink)
    const after = ModePlay.toNumberlink(output.model, f.numberlink)

    expect(Numberlink.isPipesEmpty(before)).toBe(false)
    expect(Numberlink.isPipesEmpty(after)).toBe(true)
  })

  test('reset hints used', async () => {
    const f = await Fixture({
      numberlink: VariantGridShorthand.toGrid([
        ['A', ' ', ' '],
        [' ', ' ', ' '],
        [' ', ' ', 'A'],
      ]),
    })
    const before = f.update(f.init, [
      {
        t: 'user-clicked-use-hint',
        solutions: await Solutions.find({ models: [f.numberlink], logger: Logger({ t: 'noop' }) }),
      },
    ])
    const after = f.update(before.model, [
      {
        t: 'user-clicked-reset',
      },
    ])
    expect(before.model.usedHints).not.toEqual({})
    expect(after.model.usedHints).toEqual({})
  })

  test('output reset event', async () => {
    const f = await Fixture({
      numberlink: VariantGridShorthand.toGrid([
        ['A', ' '],
        [' ', 'A'],
      ]),
    })
    const output = f.update(f.init, [
      {
        t: 'user-clicked-reset',
      },
    ])
    expect(output.events?.some((e) => e.t === 'reset')).toBe(true)
  })

  test('not output solved is no', async () => {
    const f = await Fixture({
      numberlink: VariantGridShorthand.toGrid([
        ['A', ' '],
        [' ', 'A'],
      ]),
    })
    const output = f.update(f.init, [
      {
        t: 'user-clicked-use-hint',
        solutions: await Solutions.find({ models: [f.numberlink], logger: Logger({ t: 'noop' }) }),
      },
    ])
    expect(output.events?.some((e) => e.t === 'used-hint')).toBe(true)
  })

  test('show checkmark animation on solve', async () => {
    const f = await Fixture({
      numberlink: VariantGridShorthand.toGrid([
        ['A', ' '],
        [' ', 'A'],
      ]),
    })
    const output = f.update(f.init, [...f.solutionMsgs])
    expect(output.model.showCheckmarkAnimation).toBe(true)
  })

  test('status should be solved if solved but is dragging lonely terminal', async () => {
    const f = await Fixture({
      numberlink: VariantGridShorthand.toGrid([
        ['A', ' ', ' '],
        [' ', ' ', ' '],
        ['A', ' ', 'B'],
      ]),
    })

    const output = f.update(f.init, [
      ...f.solutionMsgs,
      {
        t: 'user-pressed-down-node',
        nodeId: VariantGrid.toNodeId({ x: 2, y: 2 }),
      },
    ])
    expect(toStatus({ model: output.model, numberlink: f.numberlink })).toBe('solved')
  })
})
