import { describe, expect, it, test } from 'bun:test'
import { pipe } from '~/@/function/pipe'
import { loggerNoop } from '~/@/logger/impl-noop'
import { UseHint } from '.'
import { Flow } from '../../flow'
import { AlgoIsSolved } from '../../solutions/algo-is-solved/algo-is-solved'
import { Solutions } from '../../solutions/solutions'
import { VariantGridShorthand } from '../../variant/grid'
import { FixtureModePlayUseHint } from './fixture'

const Fixture = FixtureModePlayUseHint

describe(import.meta.file, () => {
  test('hint', async () => {
    const f = await Fixture()
    const after = f.update(f.init, [
      {
        msg: {
          t: 'user-clicked-use-hint',
          solutions: await Solutions.find({ models: [f.ctx.flow], logger: loggerNoop }),
        },
      },
    ])
    const flow = UseHint.toFlow(after.model, f.ctx.flow)
    for (const groupId of UseHint.toShowingHintGroupIds(after.model)) {
      expect(Flow.isTerminalConnectedWithPipes(flow, groupId)).toBe(true)
    }
  })

  test('hint multiple terminals', async () => {
    const f = await Fixture({
      ctxFlow: VariantGridShorthand.toGrid([
        ['A', 'B'],
        [' ', ' '],
        ['A', 'B'],
      ]),
    })

    const output = f.update(f.init, [
      {
        msg: {
          t: 'user-clicked-use-hint',
          solutions: await Solutions.find({ models: [f.ctx.flow], logger: loggerNoop }),
        },
      },
      {
        msg: {
          t: 'user-clicked-use-hint',
          solutions: await Solutions.find({ models: [f.ctx.flow], logger: loggerNoop }),
        },
      },
    ])
    const flow = UseHint.toFlow(output.model, f.ctx.flow)
    expect(AlgoIsSolved.isSolved(flow)).toBe(true)
  })

  test('output use hint event', async () => {
    const f = await Fixture({
      ctxFlow: VariantGridShorthand.toGrid([
        ['A', 'B'],
        [' ', ' '],
        ['A', 'B'],
      ]),
    })

    const output = f.update(f.init, [
      {
        msg: {
          t: 'user-clicked-use-hint',
          solutions: await Solutions.find({ models: [f.ctx.flow], logger: loggerNoop }),
        },
      },
    ])
    expect(output.events?.some((e) => e.t === 'used-hint')).toBe(true)
  })

  test('output solved event', async () => {
    const f = await Fixture({
      ctxFlow: VariantGridShorthand.toGrid([
        ['A', 'B', 'C'],
        [' ', ' ', ' '],
        ['A', 'B', 'C'],
      ]),
    })

    const output = f.update(f.init, [
      {
        msg: {
          t: 'user-clicked-use-hint',
          solutions: await Solutions.find({ models: [f.ctx.flow], logger: loggerNoop }),
        },
      },
      {
        msg: {
          t: 'user-clicked-use-hint',
          solutions: await Solutions.find({ models: [f.ctx.flow], logger: loggerNoop }),
        },
      },
      {
        msg: {
          t: 'user-clicked-use-hint',
          solutions: await Solutions.find({ models: [f.ctx.flow], logger: loggerNoop }),
        },
      },
    ])

    expect(output.events?.some((e) => e.t === 'solved')).toBe(true)
  })

  it('should not create branching in pipes after using a hint', async () => {
    const f = await Fixture({
      ctxFlow: VariantGridShorthand.toGrid([
        ['A', 'a', 'a', ' '],
        [' ', ' ', 'a', ' '],
        ['a', 'a', 'a', ' '],
        [' ', ' ', ' ', 'A'],
      ]),
    })

    const output = f.update(f.init, [
      {
        msg: {
          t: 'user-clicked-use-hint',
          solutions: await Solutions.find({ models: [f.ctx.flow], logger: loggerNoop }),
        },
      },
    ])

    const derived = UseHint.toFlow(output.model, f.ctx.flow)

    expect(Flow.hasMultipleDeadEndPipelines(derived)).toBe(false)
  })

  it('should work even with flipped terminal', async () => {
    const f = await Fixture({
      ctxFlow: VariantGridShorthand.toGrid([
        ['A', ' ', ' '],
        [' ', ' ', ' '],
        ['A', ' ', ' '],
      ]),
    })

    const terminal = Flow.toTerminalByGroupId(f.ctx.flow, 'A')
    const flipped = Flow.flipTerminal(f.ctx.flow, terminal)

    const output = f.update(
      {
        ...f.init,
        terminalsByGroupId: {
          ...flipped.terminalsByGroupId,
        },
      },
      [
        {
          msg: {
            t: 'user-clicked-use-hint',
            solutions: await Solutions.find({ models: [f.ctx.flow], logger: loggerNoop }),
          },
        },
      ],
    )

    const derived = UseHint.toFlow(output.model, f.ctx.flow)

    const pipeline = Flow.toPipelineFromGroupId(derived, 'A')

    expect(pipeline.length > 0).toBe(true)
  })

  test('record used hints', async () => {
    const f = await Fixture()
    const after = f.update(f.init, [
      {
        msg: {
          t: 'user-clicked-use-hint',
          solutions: await Solutions.find({ models: [f.ctx.flow], logger: loggerNoop }),
        },
      },
    ])
    expect(Object.keys(after.model.usedHints)).toEqual(['A'])
  })

  test('cut pipes after using a hint', async () => {
    const before = VariantGridShorthand.toGrid([
      ['A', 'B'],
      ['b', 'b'],
      ['b', ' '],
      ['b', 'b'],
      ['A', 'B'],
    ])
    const f = await Fixture({
      ctxFlow: before,
    })
    const updated = f.update(f.init, [
      {
        msg: {
          t: 'user-clicked-use-hint',
          solutions: await Solutions.find({ models: [before], logger: loggerNoop }),
        },
      },
    ])
    const after = UseHint.toFlow(updated.model, f.ctx.flow)
    expect(Flow.toPipelineFromGroupId(before, 'A').length).toEqual(0)
    expect(Flow.toPipelineFromGroupId(before, 'B').length).toEqual(6)
    expect(Flow.toPipelineFromGroupId(after, 'A').length).toEqual(4)
    expect(Flow.toPipelineFromGroupId(after, 'B').length).toEqual(0)
  })

  it('should NOT branch pipelines after using hint', async () => {
    const f = await Fixture({
      ctxFlow: VariantGridShorthand.toGrid([
        ['A', ' ', ' '],
        [' ', ' ', ' '],
        [' ', ' ', 'A'],
      ]),
    })

    const initialPipesBySourceId = VariantGridShorthand.toGrid([
      ['A', ' ', ' '],
      [' ', ' ', ' '],
      ['a', 'a', 'A'],
    ]).pipesBySourceId

    const initial: UseHint.Model = {
      ...f.init,
      pipesBySourceId: initialPipesBySourceId,
    }

    const updated = f.update(initial, [
      {
        msg: {
          t: 'user-clicked-use-hint',
          solutions: await Solutions.find({ models: [f.ctx.flow], logger: loggerNoop }),
        },
      },
    ])
    const after = UseHint.toFlow(updated.model, f.ctx.flow)
    expect(Flow.hasBranchingPipelines(after)).toBe(false)
  })

  it('should never change the positions of the terminals when using a hint', async () => {
    const f = await Fixture({
      ctxFlow: VariantGridShorthand.toGrid([
        ['A', ' ', ' '],
        [' ', ' ', ' '],
        [' ', ' ', 'A'],
      ]),
    })

    const flow = VariantGridShorthand.toGrid([
      [' ', ' ', 'A'],
      [' ', ' ', ' '],
      ['A', ' ', ' '],
    ])
    const init = UseHint.init({
      ctx: UseHint.initCtx({
        flow,
      }),
    })

    const output = f.update(init, [
      {
        msg: {
          t: 'user-clicked-use-hint',
          solutions: await Solutions.find({ models: [flow], logger: loggerNoop }),
        },
      },
    ])

    const before = UseHint.toFlow(init, f.ctx.flow)

    const after = UseHint.toFlow(output.model, f.ctx.flow)

    expect(Flow.toTerminals(before)).toEqual(Flow.toTerminals(after))
  })

  it('should update terminal orientation if needed', async () => {
    const solution = VariantGridShorthand.toGrid([
      ['A', ' ', ' '],
      ['a', ' ', ' '],
      ['a', 'a', 'A'],
    ])

    const ctxFlow = pipe(solution, Flow.removeAllPipelines, Flow.flipAllTerminals)

    const f = await Fixture({ ctxFlow: ctxFlow })

    const output = f.update(f.init, [
      {
        msg: {
          t: 'user-clicked-use-hint',
          solutions: Solutions.of([solution]),
        },
      },
    ])

    const flowNew = UseHint.toFlow(output.model, ctxFlow)

    const expected = Flow.toPipelineFromGroupId(solution, 'A')
    const actual = Flow.toPipelineFromGroupId(flowNew, 'A')

    expect(expected).toEqual(actual)
  })

  it('should work when missing intermediate terminal groups', async () => {
    const f = await Fixture({
      ctxFlow: VariantGridShorthand.toGrid([
        ['A', ' ', 'C'],
        [' ', ' ', ' '],
        ['A', ' ', 'C'],
      ]),
    })

    const solutions = await Solutions.find({ models: [f.ctx.flow], logger: loggerNoop })

    const output = f.update(f.init, [
      { msg: { t: 'user-clicked-use-hint', solutions } },
      { msg: { t: 'user-clicked-use-hint', solutions } },
    ])

    expect(output.events?.some((e) => e.t === 'solved')).toBe(true)
  })
})
