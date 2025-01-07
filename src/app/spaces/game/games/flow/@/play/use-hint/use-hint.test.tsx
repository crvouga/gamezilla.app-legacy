import { describe, expect, it, test } from 'bun:test'
import { UseHint } from '.'
import { FixtureFlowClient } from '../../client/fixture'
import { Flow } from '../../flow'
import { Solutions } from '../../solutions/solutions'
import { Variant } from '../../variant'
import { VariantGridShorthand } from '../../variant/grid'

type Input = {
  msg: UseHint.Msg
  ctx?: UseHint.Ctx
}

const Fixture = async (input?: { ctxFlow?: Variant.Model }) => {
  const f = await FixtureFlowClient()

  const ctxFlow =
    input?.ctxFlow ??
    VariantGridShorthand.toGrid([
      ['A', ' '],
      [' ', 'A'],
    ])

  const ctx = UseHint.initCtx({
    flow: ctxFlow,
    solutions: await Solutions.find([ctxFlow]),
  })

  const update = (init: UseHint.Model, inputs: Input[]): ReturnType<typeof UseHint.update> => {
    let output: ReturnType<typeof UseHint.update> = {
      model: init,
    }
    for (const input of inputs) {
      output = UseHint.update({
        ctx: UseHint.initCtx(input.ctx ?? ctx),
        model: output.model,
        msg: input.msg,
      })
    }
    return output
  }

  const init: UseHint.Model = UseHint.init({ ctx })

  return {
    ...f,
    ctx: {
      ...f.ctx,
      ...ctx,
    },
    update,
    init,
  }
}

describe(import.meta.file, () => {
  test('hint', async () => {
    const f = await Fixture()
    const after = f.update(f.init, [
      {
        msg: {
          t: 'user-clicked-use-hint',
        },
      },
    ])
    const flow = UseHint.toFlow({
      flow: f.ctx.flow,
      model: after.model,
    })
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
        },
      },
      {
        msg: {
          t: 'user-clicked-use-hint',
        },
      },
    ])
    const flow = UseHint.toFlow({
      flow: f.ctx.flow,
      model: output.model,
    })
    expect(Flow.isSolved(flow)).toBe(true)
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
        },
      },
      {
        msg: {
          t: 'user-clicked-use-hint',
        },
      },
      {
        msg: {
          t: 'user-clicked-use-hint',
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
        },
      },
    ])

    const derived = UseHint.toFlow({
      flow: f.ctx.flow,
      model: output.model,
    })

    expect(Flow.hasMultipleDeadEndPipelines(derived)).toBe(false)
  })

  it.todo('should work even with flipped terminal', async () => {
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
          },
        },
      ],
    )

    const derived = UseHint.toFlow({
      flow: f.ctx.flow,
      model: output.model,
    })

    const pipeline = Flow.toPipelineFromGroupId(derived, 'A')

    expect(pipeline.length > 0).toBe(true)
  })

  test('record used hints', async () => {
    const f = await Fixture()
    const after = f.update(f.init, [
      {
        msg: {
          t: 'user-clicked-use-hint',
        },
      },
    ])
    expect(Object.keys(after.model.usedHints)).toEqual(['A'])
  })

  test.todo('cut pipes after using a hint', async () => {
    const before = VariantGridShorthand.toGrid([
      ['A', ' ', 'B'],
      ['a', 'a', 'A'],
      [' ', 'B', ' '],
      [' ', ' ', ' '],
    ])
    const f = await Fixture({
      ctxFlow: before,
    })
    const updated = f.update(f.init, [
      {
        msg: {
          t: 'user-clicked-use-hint',
        },
      },
    ])
    const after = UseHint.toFlow({
      flow: f.ctx.flow,
      model: updated.model,
    })
    const pipelineBefore = Flow.toPipelineFromGroupId(before, 'A')
    const pipelineAfter = Flow.toPipelineFromGroupId(after, 'A')
    expect(pipelineBefore.length).toEqual(3)
    expect(pipelineAfter.length).toEqual(1)
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
        },
      },
    ])
    const after = UseHint.toFlow({
      flow: f.ctx.flow,
      model: updated.model,
    })
    expect(Flow.hasBranchingPipelines(after)).toBe(false)
  })

  it.todo('should disable hint button if puzzle is solved', async () => {
    const f = await Fixture({
      ctxFlow: VariantGridShorthand.toGrid([
        ['A', 'B'],
        ['a', 'b'],
        ['A', 'B'],
      ]),
    })
    const viewed = UseHint.viewUseHintAction({
      ctx: f.ctx,
      dispatch: () => {},
      model: f.init,
      disabled: true,
    })
    expect(viewed.disabled).toBe(true)
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
        solutions: await Solutions.find([flow]),
        flow,
      }),
    })

    const output = f.update(init, [
      {
        msg: {
          t: 'user-clicked-use-hint',
        },
      },
    ])

    const before = UseHint.toFlow({
      flow: f.ctx.flow,
      model: init,
    })

    const after = UseHint.toFlow({
      flow: f.ctx.flow,
      model: output.model,
    })

    expect(Flow.toTerminals(before)).toEqual(Flow.toTerminals(after))
  })
})
