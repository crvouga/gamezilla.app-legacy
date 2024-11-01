import { describe, expect, it, test } from 'bun:test'
import { PubSub } from 'gamezilla-app/@/core'
import { GameClientModule } from 'gamezilla-app/app/spaces/game/@/architecture/game-client-v2'
import { FlowPuzzle } from '../../@/puzzle/puzzle'
import {
  clickedExitPuzzleBuilderButton,
  clickedPuzzleListItem,
  createFlowPuzzle,
  FixtureFlowBuilderClient,
  initial,
  puzzleBuilderPressDownRandomNode,
  serverListedPuzzlesOk,
  testFlowClientCtx
} from '../@/testing/client'
import { deriveModelCore } from '../@/testing/game'
import type { MsgClient } from '../types'
import { ScreenPuzzleBuilderClient } from './client'

const Fixture = async () => {
  const f = await FixtureFlowBuilderClient()

  const flowPuzzle = await FlowPuzzle.random({})

  const init = f.update(f.init, [
    {
      msg: {
        t: 'builder-open-puzzle.clicked-puzzle-list-item',
        puzzle: flowPuzzle
      }
    }
  ])

  const renderMsg = PubSub.create<MsgClient>()
  const render = (input: { model: typeof f.model; modelCore: typeof f.modelCore }) => {
    return f.render(
      <ScreenPuzzleBuilderClient.View
        ctx={f.ctx}
        dispatch={renderMsg.pub}
        model={input.model}
        modelCore={input.modelCore}
      />
    )
  }

  return {
    ...f,
    init: {
      ...init,
      ctx: f.ctx,
      model: init.model,
      modelCore: init.modelCore
    },
    flowPuzzle,
    renderMsg,
    render
  }
}

describe(import.meta.file, () => {
  it('should open puzzle builder on list item click', async () => {
    const ctx = await testFlowClientCtx()
    const puzzle = await createFlowPuzzle(ctx)
    const output = GameClientModule.andThen(
      initial,
      serverListedPuzzlesOk(ctx, [puzzle]),
      clickedPuzzleListItem(ctx, puzzle)
    )
    const modelCore = deriveModelCore(ctx)(output)
    expect(modelCore.screen.t === 'screen-puzzle-builder' && modelCore.puzzleBuilder?.puzzle.id === puzzle.id).toBe(
      true
    )
  })

  it('should exit puzzle builder after clicking exit button', async () => {
    const ctx = await testFlowClientCtx()
    const puzzle = await createFlowPuzzle(ctx)
    const openedBuilder = GameClientModule.andThen(
      initial,
      serverListedPuzzlesOk(ctx, [puzzle]),
      clickedPuzzleListItem(ctx, puzzle)
    )

    const output = GameClientModule.andThen(
      openedBuilder,
      clickedExitPuzzleBuilderButton(ctx, deriveModelCore(ctx)(openedBuilder))
    )

    const modelCore = deriveModelCore(ctx)(output)

    expect(modelCore.screen.t === 'screen-open-puzzle-builder').toBe(true)
  })

  it('should open save prompt when exiting with unsaved changes', async () => {
    const ctx = await testFlowClientCtx()

    const puzzle = await createFlowPuzzle(ctx)

    const openedBuilder = GameClientModule.andThen(
      initial,
      serverListedPuzzlesOk(ctx, [puzzle]),
      clickedPuzzleListItem(ctx, puzzle)
    )

    const madeEdit = GameClientModule.andThen(
      openedBuilder,
      puzzleBuilderPressDownRandomNode(ctx, deriveModelCore(ctx)(openedBuilder))
    )

    const output = GameClientModule.andThen(
      madeEdit,
      clickedExitPuzzleBuilderButton(ctx, deriveModelCore(ctx)(madeEdit))
    )

    const modelCore = deriveModelCore(ctx)(output)

    expect(
      modelCore.screen.t === 'screen-puzzle-builder' && output.model.puzzleBuilderOpened === 'unsaved-changes'
    ).toBe(true)
  })

  test('render hint button', async () => {
    const f = await Fixture()
    const output = f.update(f.init, [
      {
        msg: {
          t: 'screen-puzzle-builder.user-clicked-play-mode-button'
        }
      }
    ])
    const r = f.render(output)
    expect(r.getByRole('button', f.ctx.t('game.hint'))).toBeTruthy()
  })

  test('render reset button', async () => {
    const f = await Fixture()
    const output = f.update(f.init, [
      {
        msg: {
          t: 'screen-puzzle-builder.user-clicked-play-mode-button'
        }
      }
    ])
    const r = f.render(output)
    expect(r.getByRole('button', f.ctx.t('app.reset'))).toBeTruthy()
  })
})
