import { describe, expect, it } from 'bun:test'
import { Result } from '~/@/result'
import { withEventId, withEventMeta } from '~/@/event-sourced/event'
import { Pack } from '../../@/pack/pack'
import { Puzzle } from '../../@/puzzle/puzzle'
import { FlowCreateFixtureBackend } from '../@/fixture/backend'
import type { ModelSpace, MsgSpace } from '../types'
import { ScreenPackBuilderSpace } from './space'
import { ScreenPackBuilderBackend } from './backend'

const Fixture = async () => {
  const f = await FlowCreateFixtureBackend()
  const puzzle = await Puzzle.random()
  const pack = await Pack.random({
    createdBy: puzzle.createdBy,
    puzzleIds: [puzzle.id],
  })
  await f.ctx.packDb.put(pack)
  await f.ctx.puzzleDb.put(puzzle)
  const modelSpace: ModelSpace = {
    ...f.modelSpace,
    screenPackBuilder: ScreenPackBuilderSpace.init({
      pack,
    }),
  }
  return {
    ...f,
    pack,
    modelSpace,
    deps: null,
  }
}

describe(import.meta.file, () => {
  it('should save pack after user adds a new puzzle', async () => {
    const f = await Fixture()

    const puzzle = await Puzzle.random()

    const msgSpace = withEventId<MsgSpace>({
      t: 'screen-pack-builder.user-clicked-add-puzzle-item',
      puzzle: puzzle,
      userId: puzzle.createdBy,
    })

    const modelSpaceNew = ScreenPackBuilderSpace.update({
      ctx: f.ctx,
      modelSpace: f.modelSpace,
      msgSpace,
    })

    const updated = await ScreenPackBuilderBackend.update({
      ...f,
      modelSpace: modelSpaceNew,
      msgSpace,
    })

    expect(
      updated.msgSpace?.some(
        (msgSpace) => msgSpace.t === 'screen-pack-builder.saved-pack' && msgSpace.saved.t === 'ok',
      ),
    ).toBe(true)
  })

  it('should save pack after user removes puzzle from it', async () => {
    const f = await Fixture()

    await ScreenPackBuilderBackend.update({
      ...f,
      msgSpace: withEventMeta({
        t: 'remove-puzzle-from-pack.user-clicked-remove-from-pack-button',
        puzzleIndex: 0,
        userId: f.pack.createdBy,
      }),
    })

    const before = f.pack
    const after = Result.unwrapOr(await f.ctx.packDb.get(f.pack.id), null)

    expect(before.puzzleIds.includes(f.pack.puzzleIds[0]!)).toBe(true)
    expect(after?.puzzleIds.includes(f.pack.puzzleIds[0]!)).toBe(false)
  })
})
