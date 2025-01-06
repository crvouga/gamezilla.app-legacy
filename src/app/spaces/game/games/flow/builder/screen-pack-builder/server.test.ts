import { describe, expect, it } from 'bun:test'
import { Result } from '~/@/result'
import { withEventId, withEventMeta } from '~/@/event-sourced/event'
import { Pack } from '../../@/pack/pack'
import { Puzzle } from '../../@/puzzle/puzzle'
import { FlowCreateFixtureServer } from '../@/testing/server'
import type { ModelCore, MsgCore } from '../types'
import { ScreenPackBuilderCore } from './core'
import { ScreenPackBuilderServer } from './server'

const Fixture = async () => {
  const f = await FlowCreateFixtureServer()
  const puzzle = await Puzzle.random()
  const pack = await Pack.random({
    createdBy: puzzle.createdBy,
    puzzleIds: [puzzle.id],
  })
  await f.ctx.flowPackDb.put(pack)
  await f.ctx.flowPuzzleDb.put(puzzle)
  const modelCore: ModelCore = {
    ...f.modelCore,
    screenPackBuilder: ScreenPackBuilderCore.init({
      pack,
    }),
  }
  return {
    ...f,
    pack,
    modelCore,
    deps: null,
  }
}

describe(import.meta.file, () => {
  it('should save pack after user adds a new puzzle', async () => {
    const f = await Fixture()

    const puzzle = await Puzzle.random()

    const msgCore = withEventId<MsgCore>({
      t: 'screen-pack-builder.user-clicked-add-puzzle-item',
      puzzle: puzzle,
      userId: puzzle.createdBy,
    })

    const modelCoreNew = ScreenPackBuilderCore.update({
      ctx: f.ctx,
      modelCore: f.modelCore,
      msgCore,
    })

    const updated = await ScreenPackBuilderServer.update({
      ...f,
      modelCore: modelCoreNew,
      msgCore,
    })

    expect(
      updated.msgCore?.some((msgCore) => msgCore.t === 'screen-pack-builder.saved-pack' && msgCore.saved.t === 'ok'),
    ).toBe(true)
  })

  it('should save pack after user removes puzzle from it', async () => {
    const f = await Fixture()

    await ScreenPackBuilderServer.update({
      ...f,
      msgCore: withEventMeta({
        t: 'remove-puzzle-from-pack.user-clicked-remove-from-pack-button',
        puzzleIndex: 0,
        userId: f.pack.createdBy,
      }),
    })

    const before = f.pack
    const after = Result.unwrapOr(await f.ctx.flowPackDb.get(f.pack.id), null)

    expect(before.puzzleIds.includes(f.pack.puzzleIds[0]!)).toBe(true)
    expect(after?.puzzleIds.includes(f.pack.puzzleIds[0]!)).toBe(false)
  })
})
