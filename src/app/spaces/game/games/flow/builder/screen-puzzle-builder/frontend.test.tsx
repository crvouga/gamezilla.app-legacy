import { describe, expect, it, test } from 'bun:test'
import { PubSub } from '~/@/sub'
import { GameFrontendModule } from '~/app/spaces/game/games/@/architecture/game-frontend-v2'
import { Puzzle } from '../../@/puzzle/puzzle'
import {
  clickedExitPuzzleBuilderButton,
  clickedPuzzleListItem,
  createPuzzle,
  FixtureFlowBuilderFrontend,
  initial,
  puzzleBuilderPressDownRandomNode,
  testFlowFrontendCtx,
} from '../@/fixture/frontend'
import { deriveModelSpace } from '../@/fixture/space'
import type { MsgFrontend } from '../types'
import { ScreenPuzzleBuilderFrontend } from './frontend'

const Fixture = async () => {
  const f = await FixtureFlowBuilderFrontend()

  const flowPuzzle = await Puzzle.random({})

  const init = f.update(f.init, [
    {
      msg: {
        t: 'got-msg-space',
        c: {
          t: 'screen-puzzle-builder-open.clicked-puzzle-list-item',
          puzzle: flowPuzzle,
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
    flowPuzzle,
    renderMsg,
    render,
  }
}

describe(import.meta.file, () => {
  it('should open puzzle builder on list item click', async () => {
    const ctx = await testFlowFrontendCtx()
    const puzzle = await createPuzzle(ctx)
    const output = GameFrontendModule.andThen(initial, clickedPuzzleListItem(ctx, puzzle))
    const modelSpace = deriveModelSpace(ctx, output)
    expect(
      modelSpace.screen.t === 'screen-puzzle-builder' && modelSpace.screenPuzzleBuilder?.puzzle.id === puzzle.id,
    ).toBe(true)
  })

  it('should exit puzzle builder after clicking exit button', async () => {
    const ctx = await testFlowFrontendCtx()
    const puzzle = await createPuzzle(ctx)
    const openedBuilder = GameFrontendModule.andThen(initial, clickedPuzzleListItem(ctx, puzzle))

    const output = GameFrontendModule.andThen(
      openedBuilder,
      clickedExitPuzzleBuilderButton(ctx, deriveModelSpace(ctx, openedBuilder)),
    )

    const modelSpace = deriveModelSpace(ctx, output)

    expect(modelSpace.screen.t === 'screen-puzzle-builder-open').toBe(true)
  })

  it('should open save prompt when exiting with unsaved changes', async () => {
    const ctx = await testFlowFrontendCtx()

    const puzzle = await createPuzzle(ctx)

    const openedBuilder = GameFrontendModule.andThen(initial, clickedPuzzleListItem(ctx, puzzle))

    const madeEdit = GameFrontendModule.andThen(
      openedBuilder,
      puzzleBuilderPressDownRandomNode(ctx, deriveModelSpace(ctx, openedBuilder)),
    )

    const output = GameFrontendModule.andThen(
      madeEdit,
      clickedExitPuzzleBuilderButton(ctx, deriveModelSpace(ctx, madeEdit)),
    )

    const modelSpace = deriveModelSpace(ctx, output)

    expect(
      modelSpace.screen.t === 'screen-puzzle-builder' && output.model.puzzleBuilderOpened === 'unsaved-changes',
    ).toBe(true)
  })

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
