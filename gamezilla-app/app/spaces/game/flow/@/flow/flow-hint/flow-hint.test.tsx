import { describe, expect, it, test } from 'bun:test'
import { FlowPuzzle } from '../../flow-puzzle/flow-puzzle'
import { FlowClientFixture } from '../../testing'
import { Flow } from '../flow'
import { FlowGridShorthand } from '../flow-variant/flow-grid'
import * as FlowHint from './flow-hint'

const Fixture = async (input?: { ctxflowPuzzle?: FlowPuzzle }) => {
  const f = await FlowClientFixture()

  const ctxflowPuzzle =
    input?.ctxflowPuzzle ??
    (await FlowPuzzle.random({
      flow: FlowGridShorthand.toGrid([
        ['A', ' '],
        [' ', 'A']
      ])
    }))

  const ctx = {
    flowPuzzle: ctxflowPuzzle
  }

  type Input = {
    msg: FlowHint.Msg
    ctx?: {
      flowPuzzle: FlowPuzzle
    }
  }

  const update = (init: FlowHint.Model, inputs: Input[]): ReturnType<typeof FlowHint.update> => {
    let output: ReturnType<typeof FlowHint.update> = {
      model: init
    }
    for (const input of inputs) {
      output = FlowHint.update({
        ctx: input.ctx ?? ctx,
        model: output.model,
        msg: input.msg
      })
    }
    return output
  }

  const init: FlowHint.Model = FlowHint.init({ ctx })

  return {
    ...f,
    ctx: {
      ...f.ctx,
      ...ctx
    },
    update,
    init
  }
}

describe(import.meta.file, () => {
  test('hint', async () => {
    const f = await Fixture()
    const after = f.update(f.init, [
      {
        msg: {
          t: 'user-clicked-hint'
        }
      }
    ])
    const flow = FlowHint.toFlow({
      flow: f.ctx.flowPuzzle.flow,
      model: after.model
    })
    for (const groupId of FlowHint.toShowingHintGroupIds(after.model)) {
      expect(Flow.isTerminalConnectedWithPipes(flow, groupId)).toBe(true)
    }
  })

  test('hint multiple terminals', async () => {
    const f = await Fixture({
      ctxflowPuzzle: await FlowPuzzle.random({
        flow: FlowGridShorthand.toGrid([
          ['A', 'B'],
          [' ', ' '],
          ['A', 'B']
        ])
      })
    })

    const output = f.update(f.init, [
      {
        msg: {
          t: 'user-clicked-hint'
        }
      },
      {
        msg: {
          t: 'user-clicked-hint'
        }
      }
    ])
    const flow = FlowHint.toFlow({
      flow: f.ctx.flowPuzzle.flow,
      model: output.model
    })
    expect(Flow.isSolved(flow)).toBe(true)
  })

  test('output use hint event', async () => {
    const f = await Fixture({
      ctxflowPuzzle: await FlowPuzzle.random({
        flow: FlowGridShorthand.toGrid([
          ['A', 'B'],
          [' ', ' '],
          ['A', 'B']
        ])
      })
    })

    const output = f.update(f.init, [
      {
        msg: {
          t: 'user-clicked-hint'
        }
      }
    ])
    expect(output.event?.t).toBe('used-hint')
  })

  test('output solved event', async () => {
    const f = await Fixture({
      ctxflowPuzzle: await FlowPuzzle.random({
        flow: FlowGridShorthand.toGrid([
          ['A', 'B', 'C'],
          [' ', ' ', ' '],
          ['A', 'B', 'C']
        ])
      })
    })

    const output = f.update(f.init, [
      {
        msg: {
          t: 'user-clicked-hint'
        }
      },
      {
        msg: {
          t: 'user-clicked-hint'
        }
      },
      {
        msg: {
          t: 'user-clicked-hint'
        }
      }
    ])
    expect(output.event?.t).toBe('solved')
  })

  it('should not create branching in pipes after using a hint', async () => {
    const f = await Fixture({
      ctxflowPuzzle: await FlowPuzzle.random({
        flow: FlowGridShorthand.toGrid([
          ['A', 'a', 'a', ' '],
          [' ', ' ', 'a', ' '],
          ['a', 'a', 'a', ' '],
          [' ', ' ', ' ', 'A']
        ])
      })
    })

    const output = f.update(f.init, [
      {
        msg: {
          t: 'user-clicked-hint'
        }
      }
    ])

    const derived = FlowHint.toFlow({
      flow: f.ctx.flowPuzzle.flow,
      model: output.model
    })

    expect(Flow.hasMultipleDeadEndPipelines(derived)).toBe(false)
  })

  it('should work even with flipped terminal', async () => {
    const f = await Fixture({
      ctxflowPuzzle: await FlowPuzzle.random({
        flow: FlowGridShorthand.toGrid([
          ['A', ' ', ' '],
          [' ', ' ', ' '],
          ['A', ' ', ' ']
        ])
      })
    })

    const terminal = Flow.toTerminalByGroupId(f.ctx.flowPuzzle.flow, 'A')
    const flipped = Flow.flipTerminal(f.ctx.flowPuzzle.flow, terminal)

    const output = f.update(
      {
        ...f.init,
        terminalsByGroupId: {
          ...flipped.terminalsByGroupId
        }
      },
      [
        {
          msg: {
            t: 'user-clicked-hint'
          }
        }
      ]
    )

    const derived = FlowHint.toFlow({
      flow: f.ctx.flowPuzzle.flow,
      model: output.model
    })

    const pipeline = Flow.toPipelineFromGroupId(derived, 'A')

    expect(pipeline.length > 0).toBe(true)
  })

  test('record used hints', async () => {
    const f = await Fixture()
    const after = f.update(f.init, [
      {
        msg: {
          t: 'user-clicked-hint'
        }
      }
    ])
    expect(Object.keys(after.model.usedHints)).toEqual(['A'])
  })

  test.todo('cut pipes after using a hint', async () => {
    const before = FlowGridShorthand.toGrid([
      ['A', ' ', 'B'],
      ['a', 'a', 'A'],
      [' ', 'B', ' '],
      [' ', ' ', ' ']
    ])
    const f = await Fixture({
      ctxflowPuzzle: await FlowPuzzle.random({
        flow: before
      })
    })
    const updated = f.update(f.init, [
      {
        msg: {
          t: 'user-clicked-hint'
        }
      }
    ])
    const after = FlowHint.toFlow({
      flow: f.ctx.flowPuzzle.flow,
      model: updated.model
    })
    const pipelineBefore = Flow.toPipelineFromGroupId(before, 'A')
    const pipelineAfter = Flow.toPipelineFromGroupId(after, 'A')
    expect(pipelineBefore.length).toEqual(3)
    expect(pipelineAfter.length).toEqual(1)
  })

  it('should NOT branch pipelines after using hint', async () => {
    const f = await Fixture({
      ctxflowPuzzle: await FlowPuzzle.random({
        flow: FlowGridShorthand.toGrid([
          ['A', ' ', ' '],
          [' ', ' ', ' '],
          [' ', ' ', 'A']
        ])
      })
    })

    const initialPipesBySourceId = FlowGridShorthand.toGrid([
      ['A', ' ', ' '],
      [' ', ' ', ' '],
      ['a', 'a', 'A']
    ]).pipesBySourceId

    const initial: FlowHint.Model = {
      ...f.init,
      pipesBySourceId: initialPipesBySourceId
    }

    const updated = f.update(initial, [
      {
        msg: {
          t: 'user-clicked-hint'
        }
      }
    ])
    const after = FlowHint.toFlow({
      flow: f.ctx.flowPuzzle.flow,
      model: updated.model
    })
    expect(Flow.hasBranchingPipelines(after)).toBe(false)
  })

  it.todo('should disable hint button if puzzle is solved', async () => {
    const f = await Fixture({
      ctxflowPuzzle: await FlowPuzzle.random({
        flow: FlowGridShorthand.toGrid([
          ['A', 'B'],
          ['a', 'b'],
          ['A', 'B']
        ])
      })
    })
    const viewed = FlowHint.viewHintAction({
      ctx: f.ctx,
      dispatch: () => {},
      model: f.init
    })
    expect(viewed.disabled).toBe(true)
  })

  it('should never change the positions of the terminals when using a hint', async () => {
    const f = await Fixture({
      ctxflowPuzzle: await FlowPuzzle.random({
        flow: FlowGridShorthand.toGrid([
          ['A', ' ', ' '],
          [' ', ' ', ' '],
          [' ', ' ', 'A']
        ])
      })
    })

    const init = FlowHint.init({
      ctx: {
        flowPuzzle: await FlowPuzzle.random({
          flow: FlowGridShorthand.toGrid([
            [' ', ' ', 'A'],
            [' ', ' ', ' '],
            ['A', ' ', ' ']
          ])
        })
      }
    })

    const output = f.update(init, [
      {
        msg: {
          t: 'user-clicked-hint'
        }
      }
    ])

    const before = FlowHint.toFlow({
      flow: f.ctx.flowPuzzle.flow,
      model: init
    })

    const after = FlowHint.toFlow({
      flow: f.ctx.flowPuzzle.flow,
      model: output.model
    })

    expect(Flow.toTerminals(before)).toEqual(Flow.toTerminals(after))
  })
})
