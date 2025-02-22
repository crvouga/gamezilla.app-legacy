import { describe, expect, it, test } from 'bun:test'
import { PubSub } from '~/@/sub'
import { Puzzle } from '../../../@/puzzle/puzzle'
import { FixtureFlowBuilderFrontend } from '../../@/fixture/frontend'
import type { MsgFrontend } from '../../types'
import { ScreenPuzzleBuilderFrontend } from './frontend'

const Fixture = async () => {
  const f = await FixtureFlowBuilderFrontend()

  const puzzle = await Puzzle.random({})

  const init = f.update(f.init, [
    {
      msg: {
        t: 'got-msg-space',
        c: {
          t: 'screen-puzzle-builder-open.clicked-puzzle-db-query-item',
          puzzle: puzzle,
          userId: f.ctx.currentUserId,
        },
      },
    },
  ])

  const renderMsg = PubSub.create<MsgFrontend>()
  const render = (input: { model: typeof f.model; modelSpace: typeof f.modelSpace }) => {
    return f.render(
      <ScreenPuzzleBuilderFrontend.View
        ctx={f.ctx}
        dispatch={renderMsg.pub}
        model={input.model}
        modelSpace={input.modelSpace}
      />,
    )
  }

  return {
    ...f,
    init: {
      ...init,
      ctx: f.ctx,
      model: init.model,
      modelSpace: init.modelSpace,
    },
    puzzle,
    renderMsg,
    render,
  }
}

describe(import.meta.file, () => {
  it.todo('should open puzzle builder on list item click', async () => {})

  it.todo('should exit puzzle builder after clicking exit button', async () => {})

  it.todo('should open save prompt when exiting with unsaved changes', async () => {})

  test('render hint button', async () => {
    const f = await Fixture()
    const output = f.update(f.init, [
      {
        msg: {
          t: 'screen-puzzle-builder.user-clicked-play-mode-button',
        },
      },
    ])
    const r = f.render(output)
    expect(r.getByRole('button', f.ctx.t('game.hint'))).toBeTruthy()
  })

  test('render reset button', async () => {
    const f = await Fixture()
    const output = f.update(f.init, [
      {
        msg: {
          t: 'screen-puzzle-builder.user-clicked-play-mode-button',
        },
      },
    ])
    const r = f.render(output)
    expect(r.getByRole('button', f.ctx.t('app.reset'))).toBeTruthy()
  })
})
