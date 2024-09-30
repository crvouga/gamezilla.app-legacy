import { describe, expect, it } from 'bun:test'
import { Posix, RequestResponse, TimeSpan } from 'gamezilla-app/@/core'
import { didSendToServer, didShowErrorSm } from 'gamezilla-app/app/@/client'
import { FixtureSpaceClient } from 'gamezilla-app/app/spaces/@/fixture/client'
import { FlowPack } from '..'
import { FlowPuzzle } from '../../flow-puzzle'
import { FlowPackPuzzlesGridClient } from './flow-pack-puzzles-grid.client'
import type { FlowPackGridClientCtx, ModelClient, MsgClient, MsgToClient } from './flow-pack-puzzles-grid.types'

type Input = {
  ctx?: FlowPackGridClientCtx
  msg?: MsgClient
  msgServer?: MsgToClient
}

const Fixture = async () => {
  const f = await FixtureSpaceClient()
  const puzzle = await FlowPuzzle.random({
    createdBy: f.ctx.currentUserId
  })
  const pack = await FlowPack.random({
    puzzleIds: [puzzle.id],
    createdBy: f.ctx.currentUserId
  })

  const ctx: FlowPackGridClientCtx = {
    ...f.ctx,
    pack
  }

  const updates = (initial: ModelClient, msgs: Input[]) => {
    const outputs: ReturnType<typeof FlowPackPuzzlesGridClient.update>[] = [
      {
        model: initial
      }
    ]

    let model = initial

    for (const msg of msgs) {
      const outputNew = FlowPackPuzzlesGridClient.update({
        ctx,
        model,
        ...msg
      })
      model = outputNew.model
      outputs.push(outputNew)
    }

    return outputs
  }

  const update = (initial: ModelClient, msgs: Input[]) => {
    const outputs = updates(initial, msgs)
    const latestOutput = outputs[outputs.length - 1]
    if (!latestOutput) {
      throw new Error('latestOutput is undefined')
    }
    return latestOutput
  }

  const init = {
    model: FlowPackPuzzlesGridClient.initClient
  }

  return {
    ...f,
    init,
    pack,
    puzzle,
    ctx,
    update
  }
}

const msgServerListedByPuzzlesByIdOk = (puzzles: FlowPuzzle[]): Input => ({
  msgServer: {
    t: 'listed-puzzles-by-id',
    listed: {
      t: 'ok',
      value: {
        items: puzzles,
        limit: puzzles.length,
        offset: 0,
        total: puzzles.length
      }
    },
    causedBy: null
  }
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
          t: 'user-observed-grid'
        }
      }
    ])
    expect(didSendToServer(output, (msg) => msg.t === 'list-puzzles-by-id')).toBe(true)
  })

  it('should not fetch puzzles when all are not missing', async () => {
    const f = await Fixture()
    const output = f.update(f.init.model, [
      msgServerListedByPuzzlesByIdOk([f.puzzle]),
      {
        msg: {
          t: 'user-observed-grid'
        }
      }
    ])
    expect(didSendToServer(output, (msg) => msg.t === 'list-puzzles-by-id')).toBe(false)
  })

  it('should fetch puzzles when some are missing', async () => {
    const f = await Fixture()
    const output = f.update(f.init.model, [
      {
        msg: {
          t: 'elapsed'
        }
      }
    ])
    expect(didSendToServer(output, (msg) => msg.t === 'list-puzzles-by-id')).toBe(true)
  })

  it('should have missing puzzle ids in list request', async () => {
    const f = await Fixture()
    const output = f.update(f.init.model, [
      {
        msg: {
          t: 'user-observed-grid'
        }
      }
    ])
    expect(
      didSendToServer(output, (msg) => msg.t === 'list-puzzles-by-id' && areEqualSets(msg.puzzleIds, f.pack.puzzleIds))
    ).toBe(true)
  })

  it('should record puzzles listed by server', async () => {
    const f = await Fixture()
    const output = f.update(f.init.model, [msgServerListedByPuzzlesByIdOk([f.puzzle])])
    expect(output.model.puzzles[f.puzzle.id]).toEqual(f.puzzle)
  })

  it('should show an error when server sends an error while listing puzzles', async () => {
    const f = await Fixture()
    const output = f.update(f.init.model, [
      {
        msgServer: {
          t: 'listed-puzzles-by-id',
          listed: {
            t: 'err',
            error: 'Some error'
          },
          causedBy: null
        }
      }
    ])

    expect(didShowErrorSm(output, f.ctx.t('app.something-went-wrong'))).toBe(true)
  })

  it('should be in a loading state after requesting to list puzzles', async () => {
    const f = await Fixture()
    const output = f.update(f.init.model, [
      {
        msg: {
          t: 'user-observed-grid'
        }
      }
    ])
    expect(RequestResponse.isRequesting(output.model.request)).toBe(true)
  })

  it('should in an ok state after server listed puzzles', async () => {
    const f = await Fixture()
    const output = f.update(f.init.model, [
      {
        msg: {
          t: 'user-observed-grid'
        }
      },
      msgServerListedByPuzzlesByIdOk([f.puzzle])
    ])
    expect(RequestResponse.isOk(output.model.request)).toBe(true)
  })

  it('should timeout request after too much time', async () => {
    const f = await Fixture()
    const output = f.update(f.init.model, [
      {
        msg: {
          t: 'user-observed-grid'
        }
      },
      {
        ctx: {
          ...f.ctx,
          now: Posix.future(f.ctx.now, TimeSpan.minutes(5))
        },
        msg: {
          t: 'elapsed'
        }
      }
    ])
    expect(RequestResponse.isTimedOut(output.model.request)).toBe(true)
  })
})
