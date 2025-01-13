import { describe, expect, it } from 'bun:test'
import { RequestResponse } from '~/@/request-response/request-response'
import { Posix } from '~/@/time/posix'
import { TimeSpan } from '~/@/time/time-span'
import { didSendToBackend, didShowErrorSm } from '~/app/@/frontend/cmd'
import { FixtureSpacesFrontend } from '~/app/spaces/@/fixture/frontend'
import { Puzzle } from '../../puzzle/puzzle'
import { Pack } from '../pack'
import { PackPuzzlesGridFrontend } from './frontend'
import type { ModelFrontend, MsgFrontend, MsgToFrontend, PackGridFrontendCtx } from './types'
import { Solutions } from '../../solutions/solutions'

type Input = {
  ctx?: PackGridFrontendCtx
  msg?: MsgFrontend
  msgBackend?: MsgToFrontend
}

const Fixture = async () => {
  const f = await FixtureSpacesFrontend()
  const puzzle = await Puzzle.random({ createdBy: f.ctx.currentUserId })
  const pack = await Pack.random({ puzzleIds: [puzzle.id], createdBy: f.ctx.currentUserId })
  const ctx: PackGridFrontendCtx = {
    ...f.ctx,
    pack,
  }

  const updates = (initial: ModelFrontend, msgs: Input[]) => {
    const outputs: ReturnType<typeof PackPuzzlesGridFrontend.update>[] = [
      {
        model: initial,
      },
    ]

    let model = initial

    for (const msg of msgs) {
      const outputNew = PackPuzzlesGridFrontend.update({
        ctx,
        model,
        ...msg,
      })
      model = outputNew.model
      outputs.push(outputNew)
    }

    return outputs
  }

  const update = (initial: ModelFrontend, msgs: Input[]) => {
    const outputs = updates(initial, msgs)
    const latestOutput = outputs[outputs.length - 1]
    if (!latestOutput) {
      throw new Error('latestOutput is undefined')
    }
    return latestOutput
  }

  const init = {
    model: PackPuzzlesGridFrontend.initFrontend,
  }

  return {
    ...f,
    init,
    pack,
    puzzle,
    ctx,
    update,
  }
}

const msgBackendListedByPuzzlesByIdOk = async (puzzles: Puzzle[]): Promise<Input> => ({
  msgBackend: {
    t: 'listed-puzzles-by-id',
    listed: {
      t: 'ok',
      value: {
        puzzles: {
          items: puzzles,
          limit: puzzles.length,
          offset: 0,
          total: puzzles.length,
        },
        solutions: await Solutions.find(puzzles.map((p) => p.flow)),
      },
    },
    causedBy: null,
  },
})

const isSubset = <T,>(subArray: T[], superArray: T[]): boolean => {
  return subArray.every((item) => superArray.includes(item))
}

const areEqualSets = <T,>(a: T[], b: T[]): boolean => {
  return isSubset(a, b) && isSubset(b, a)
}

describe(import.meta.file, () => {
  it('should send a request to list puzzles when grid is visible', async () => {
    const f = await Fixture()
    const output = f.update(f.init.model, [
      {
        msg: {
          t: 'user-observed-grid',
        },
      },
    ])
    expect(didSendToBackend(output, (msg) => msg.t === 'list-puzzles-by-id')).toBe(true)
  })

  it('should not fetch puzzles when all are not missing', async () => {
    const f = await Fixture()
    const output = f.update(f.init.model, [
      await msgBackendListedByPuzzlesByIdOk([f.puzzle]),
      {
        msg: {
          t: 'user-observed-grid',
        },
      },
    ])
    expect(didSendToBackend(output, (msg) => msg.t === 'list-puzzles-by-id')).toBe(false)
  })

  it('should fetch puzzles when some are missing', async () => {
    const f = await Fixture()
    const output = f.update(f.init.model, [
      {
        msg: {
          t: 'elapsed',
        },
      },
    ])
    expect(didSendToBackend(output, (msg) => msg.t === 'list-puzzles-by-id')).toBe(true)
  })

  it('should have missing puzzle ids in list request', async () => {
    const f = await Fixture()
    const output = f.update(f.init.model, [
      {
        msg: {
          t: 'user-observed-grid',
        },
      },
    ])
    expect(
      didSendToBackend(
        output,
        (msg) => msg.t === 'list-puzzles-by-id' && areEqualSets(msg.puzzleIds, f.pack.puzzleIds),
      ),
    ).toBe(true)
  })

  it('should record puzzles listed by backend', async () => {
    const f = await Fixture()
    const output = f.update(f.init.model, [await msgBackendListedByPuzzlesByIdOk([f.puzzle])])
    expect(output.model.puzzles[f.puzzle.id]).toEqual(f.puzzle)
  })

  it('should show an error when backend sends an error while listing puzzles', async () => {
    const f = await Fixture()
    const output = f.update(f.init.model, [
      {
        msgBackend: {
          t: 'listed-puzzles-by-id',
          listed: {
            t: 'err',
            error: 'Some error',
          },
          causedBy: null,
        },
      },
    ])

    expect(didShowErrorSm(output, f.ctx.t('app.something-went-wrong'))).toBe(true)
  })

  it('should be in a loading state after requesting to list puzzles', async () => {
    const f = await Fixture()
    const output = f.update(f.init.model, [
      {
        msg: {
          t: 'user-observed-grid',
        },
      },
    ])
    expect(RequestResponse.isRequesting(output.model.request)).toBe(true)
  })

  it('should in an ok state after backend listed puzzles', async () => {
    const f = await Fixture()
    const output = f.update(f.init.model, [
      {
        msg: {
          t: 'user-observed-grid',
        },
      },
      await msgBackendListedByPuzzlesByIdOk([f.puzzle]),
    ])
    expect(RequestResponse.isOk(output.model.request)).toBe(true)
  })

  it('should timeout request after too much time', async () => {
    const f = await Fixture()
    const output = f.update(f.init.model, [
      {
        msg: {
          t: 'user-observed-grid',
        },
      },
      {
        ctx: {
          ...f.ctx,
          now: Posix.future(f.ctx.now, TimeSpan.minutes(5)),
        },
        msg: {
          t: 'elapsed',
        },
      },
    ])
    expect(RequestResponse.isTimedOut(output.model.request)).toBe(true)
  })
})
