import { describe, expect, test } from 'bun:test'
import { withEventMeta } from '~/@/event-sourced/event'
import { didPlaySound } from '~/app/@/frontend/cmd'
import { FixturePackBuilderFrontend } from '../@/fixture/frontend'
import { ScreenAddPuzzle } from './frontend'
import { PubSub } from '~/@/sub'
import { MsgFrontend } from '../types'
import { ScreenAddPuzzleSpace } from './space'

const Fixture = async () => {
  const f = await FixturePackBuilderFrontend()
  const renderMsg = PubSub.create<MsgFrontend>()
  const render = (input: { model: typeof f.model; modelSpace: typeof f.modelSpace }) => {
    return f.render(
      <ScreenAddPuzzle.View ctx={f.ctx} dispatch={renderMsg.pub} model={input.model} modelSpace={input.modelSpace} />,
    )
  }
  return {
    ...f,
    render,
    renderMsg,
  }
}

describe(import.meta.file, () => {
  test('play sound opening add puzzle screen', async () => {
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

  test('play sound sound clicking puzzle list item', async () => {
    const f = await Fixture()

    const output = ScreenAddPuzzle.update({
      ...f,
      msgSpace: withEventMeta({
        t: 'screen-pack-builder.screen-add-puzzle.user-clicked-puzzle-list-item',
        userId: f.ctx.currentUserId,
        puzzleId: f.puzzle.id,
      }),
    })

    expect(didPlaySound(output)).toBe(true)
  })

  test('submit button should be disabled when no puzzles are selected', async () => {
    const f = await Fixture()
    const output = ScreenAddPuzzle.update({ ...f })
    const r = f.render({ model: output.model, modelSpace: f.modelSpace })
    const submitButton = r.query("[type='submit']")
    expect(submitButton?.disabled).toBe(true)
  })

  test('submit button should NOT be disabled when some puzzles are selected', async () => {
    const f = await Fixture()
    const modelSpace = ScreenAddPuzzleSpace.updateSpace({
      ...f,
      msgSpace: withEventMeta({
        t: 'screen-pack-builder.screen-add-puzzle.user-clicked-puzzle-list-item',
        userId: f.ctx.currentUserId,
        puzzleId: f.puzzle.id,
      }),
    })
    const r = f.render({ model: f.model, modelSpace })
    const submitButton = r.query("[type='submit']")
    expect(submitButton?.disabled).toBe(false)
  })
})
