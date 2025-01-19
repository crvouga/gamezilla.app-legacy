import { describe, expect, it } from 'bun:test'
import { withEventMeta } from '~/@/event-sourced/event'
import { didPlaySound } from '~/app/@/frontend/cmd'
import { Pack } from '../../../@/pack/pack'
import { Puzzle } from '../../../@/puzzle/puzzle'
import { FixtureFlowBuilderFrontend } from '../../@/fixture/frontend'
import type { ModelFrontend, ModelSpace } from '../../types'
import { ScreenPackBuilderSpace } from '../space'
import { ScreenAddPuzzle } from './frontend'

export const Fixture = async () => {
  const f = await FixtureFlowBuilderFrontend()
  const puzzle = await Puzzle.random({ createdBy: f.ctx.currentUserId })
  const pack = await Pack.random({ createdBy: f.ctx.currentUserId, puzzleIds: [puzzle.id] })
  const ctxNew: typeof f.ctx = {
    ...f.ctx,
    puzzles: { ...f.ctx.puzzles, [puzzle.id]: puzzle },
    packs: { ...f.ctx.packs, [pack.id]: pack },
  }
  const model: ModelFrontend = { ...f.model }
  const modelSpace: ModelSpace = { ...f.modelSpace, screenPackBuilder: ScreenPackBuilderSpace.init({ pack }) }

  return {
    ...f,
    ctx: ctxNew,
    pack,
    puzzle,
    model,
    modelSpace,
  }
}

describe(import.meta.file, () => {
  it('should play sound opening add puzzle screen', async () => {
    const f = await Fixture()

    const output = ScreenAddPuzzle.update({
      ...f,
      msgSpace: withEventMeta({
        t: 'screen-pack-builder.user-clicked-open-add-puzzle-screen-button',
        userId: f.ctx.currentUserId,
      }),
    })

    expect(didPlaySound(output)).toBe(true)
  })
})
