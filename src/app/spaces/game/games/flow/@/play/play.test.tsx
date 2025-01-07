import { describe, expect, it, test } from 'bun:test'
import { Play } from '.'
import { Flow } from '../flow'
import { Solutions } from '../solutions/solutions'
import type { Variant } from '../variant'
import { VariantGrid } from '../variant/grid'
import { VariantGridShorthand } from '../variant/grid/grid-shorthand'
import { toStatus } from './play'

const Fixture = async (input: { ctxFlow: Variant.Model }) => {
  const ctx: Play.Ctx = Play.initCtx({
    solutions: await Solutions.find([input.ctxFlow]),
    flow: input.ctxFlow,
  })

  const init = Play.init({ ctx })

  const update = (init: Play.Model, msgs: Play.Msg[]) => {
    return msgs.reduce<ReturnType<typeof Play.update>>(
      (output, msg) => Play.update({ ctx, model: output.model, msg }),
      { model: init },
    )
  }

  const solutionMsgs = Play.toSolutionMsgs({
    flow: input.ctxFlow,
  })

  return {
    flow: input.ctxFlow,
    init,
    update,
    solutionMsgs,
  }
}

describe(import.meta.file, () => {
  test('to solution msgs', async () => {
    const flow = VariantGridShorthand.toGrid([
      ['A', ' ', ' '],
      [' ', 'B', ' '],
      [' ', ' ', 'A'],
    ])

    const f = await Fixture({
      ctxFlow: flow,
    })

    const msgs = Play.toSolutionMsgs({
      flow,
    })

    const before = Play.toFlow({
      flow,
      model: f.init,
    })

    const after = Play.toFlow({
      flow,
      model: f.update(f.init, msgs).model,
    })

    expect(Flow.isSolved(before)).toBe(false)
    expect(Flow.isSolved(after)).toBe(true)
  })

  it('should output connected terminals event', async () => {
    const flow = VariantGridShorthand.toGrid([
      ['A', ' ', 'B'],
      ['a', 'B', ' '],
      ['a', ' ', 'A'],
    ])
    const f = await Fixture({
      ctxFlow: flow,
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

  it('should output started dragging event', async () => {
    const flow = VariantGridShorthand.toGrid([
      ['A', ' ', ' '],
      ['a', 'B', ' '],
      ['a', ' ', 'A'],
    ])
    const f = await Fixture({
      ctxFlow: flow,
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

  it('should output solved event', async () => {
    const flow = VariantGridShorthand.toGrid([
      ['A', ' ', ' '],
      ['a', 'B', ' '],
      ['a', ' ', 'A'],
    ])
    const f = await Fixture({
      ctxFlow: flow,
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

  it('should output solved event even after dragging left the board', async () => {
    const flow = VariantGridShorthand.toGrid([
      ['A', ' ', ' '],
      ['a', 'B', ' '],
      ['a', ' ', 'A'],
    ])
    const f = await Fixture({
      ctxFlow: flow,
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

  it('should not output solved event after dragging left the board if not connected', async () => {
    const flow = VariantGridShorthand.toGrid([
      ['A', ' ', ' '],
      ['a', 'B', ' '],
      ['a', ' ', 'A'],
    ])
    const f = await Fixture({
      ctxFlow: flow,
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

  it('should not output solved if not pressed up on terminal', async () => {
    const flow = VariantGridShorthand.toGrid([
      ['A', ' ', ' '],
      ['a', 'B', ' '],
      ['a', ' ', 'A'],
    ])
    const f = await Fixture({
      ctxFlow: flow,
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

  it('should not output solved event if terminals are not connected', async () => {
    const flow = VariantGridShorthand.toGrid([
      ['A', ' ', ' '],
      ['a', 'B', ' '],
      ['a', 'a', 'A'],
    ])

    const f = await Fixture({
      ctxFlow: flow,
    })

    const output = f.update(f.init, [
      {
        t: 'user-pressed-down-node',
        nodeId: VariantGrid.toNodeId({
          x: 1,
          y: 1,
        }),
      },
      {
        t: 'user-dragged-over-node',
        nodeId: VariantGrid.toNodeId({
          x: 1,
          y: 0,
        }),
      },
      {
        t: 'user-pressed-up-node',
        nodeId: VariantGrid.toNodeId({
          x: 1,
          y: 0,
        }),
      },
    ])

    expect(output.events?.every((e) => e.t !== 'solved')).toBe(true)
  })

  test('hint', async () => {
    const flow = VariantGridShorthand.toGrid([
      ['A', ' '],
      [' ', 'A'],
    ])
    const f = await Fixture({
      ctxFlow: flow,
    })

    const msgs: Play.Msg[] = [
      {
        t: 'user-pressed-down-node',
        nodeId: VariantGrid.toNodeId({
          x: 1,
          y: 1,
        }),
      },
      {
        t: 'user-dragged-over-node',
        nodeId: VariantGrid.toNodeId({
          x: 1,
          y: 0,
        }),
      },
      {
        t: 'user-pressed-up-node',
        nodeId: VariantGrid.toNodeId({
          x: 1,
          y: 0,
        }),
      },
    ]

    const output = f.update(f.init, msgs)

    expect(output.events?.every((e) => e.t !== 'solved')).toBe(true)
  })

  test('derive flow with hints', async () => {
    const flow = VariantGridShorthand.toGrid([
      ['A', ' '],
      [' ', 'A'],
    ])
    const f = await Fixture({
      ctxFlow: flow,
    })

    const model = f.update(f.init, [
      {
        t: 'user-clicked-use-hint',
      },
    ]).model

    const flowNew = Play.toFlow({
      flow,
      model,
    })

    expect(Flow.isSolved(flowNew)).toBe(true)
  })

  it('should not output solved event when drawing from incomplete terminal and then leave drawing', async () => {
    const flow = VariantGridShorthand.toGrid([
      ['B', ' ', 'A'],
      [' ', ' ', 'a'],
      [' ', ' ', 'A'],
    ])
    const f = await Fixture({
      ctxFlow: flow,
    })

    const msgs: Play.Msg[] = [
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
      ctxFlow: VariantGridShorthand.toGrid([
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

    const before = Play.toFlow({
      flow: f.flow,
      model: f.init,
    })
    const after = Play.toFlow({
      flow: f.flow,
      model: output.model,
    })

    expect(Flow.isPipesEmpty(before)).toBe(false)
    expect(Flow.isPipesEmpty(after)).toBe(true)
  })

  test('reset hints used', async () => {
    const f = await Fixture({
      ctxFlow: VariantGridShorthand.toGrid([
        ['A', ' ', ' '],
        [' ', ' ', ' '],
        [' ', ' ', 'A'],
      ]),
    })
    const before = f.update(f.init, [
      {
        t: 'user-clicked-use-hint',
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
      ctxFlow: VariantGridShorthand.toGrid([
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
      ctxFlow: VariantGridShorthand.toGrid([
        ['A', ' '],
        [' ', 'A'],
      ]),
    })
    const output = f.update(f.init, [
      {
        t: 'user-clicked-use-hint',
      },
    ])
    expect(output.events?.some((e) => e.t === 'used-hint')).toBe(true)
  })

  test('show checkmark animation on solve', async () => {
    const f = await Fixture({
      ctxFlow: VariantGridShorthand.toGrid([
        ['A', ' '],
        [' ', 'A'],
      ]),
    })
    const output = f.update(f.init, [...f.solutionMsgs])
    expect(output.model.showCheckmarkAnimation).toBe(true)
  })

  test('status should be solved if solved but is dragging lonely terminal', async () => {
    const f = await Fixture({
      ctxFlow: VariantGridShorthand.toGrid([
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
    expect(toStatus({ model: output.model, flow: f.flow })).toBe('solved')
  })
})
