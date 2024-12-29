import { describe, expect, it } from 'bun:test'
import { Ok } from '~/@/core'
import { andThen } from '~/app/spaces/games/@/architecture/game-client-v2'
import type { FlowClientCtx } from '../../../@/client/ctx'
import { Pack } from '../../../@/pack/pack'
import { Puzzle } from '../../../@/puzzle/puzzle'
import {
  FixtureFlowBuilderClient,
  FixureUpdateInput,
  clickedExitPuzzleButton,
  clickedOpenPuzzlePickerButton,
  clickedPuzzleGridItem,
  clickedPuzzlePickerItem,
  closedPuzzlePickerDrawer,
  createPack,
  createPuzzle,
  initial,
  serverCreatedPack,
  testFlowClientCtx
} from '../../@/testing/client'
import { deriveModelCore } from '../../@/testing/core'
import { BuilderCore } from '../../core'
import type { ModelClient, ModelCore } from '../../types'
import { ScreenPackBuilderClient } from '../client'
import { ScreenPackBuilderCore } from '../core'

const clickedMoreButton = (ctx: FlowClientCtx) => (model: ModelClient) => {
  return ScreenPackBuilderClient.update({
    ctx,
    model,
    modelCore: BuilderCore.init({ ctx }),
    msg: {
      t: 'got-msg-core',
      c: {
        t: 'screen-pack-builder.puzzle-screen.user-clicked-more-button',
        userId: ctx.currentUserId
      }
    }
  })
}

const closedMoreDrawer = (ctx: FlowClientCtx) => (model: ModelClient) => {
  return ScreenPackBuilderClient.update({
    ctx,
    model,
    modelCore: BuilderCore.init({ ctx }),
    msg: {
      t: 'got-msg-core',
      c: {
        t: 'screen-pack-builder.puzzle-screen.user-closed-more-drawer',
        userId: ctx.currentUserId
      }
    }
  })
}

export const Fixture = async () => {
  const f = await FixtureFlowBuilderClient()
  const puzzle = await Puzzle.random({
    createdBy: f.ctx.currentUserId
  })
  const pack = await Pack.random({
    createdBy: f.ctx.currentUserId,
    puzzleIds: [puzzle.id]
  })
  const ctxNew: typeof f.ctx = {
    ...f.ctx,
    puzzles: {
      ...f.ctx.puzzles,
      [puzzle.id]: puzzle
    },
    packs: {
      ...f.ctx.packs,
      [pack.id]: pack
    }
  }
  const model: ModelClient = {
    ...f.model
  }
  const modelCore: ModelCore = {
    ...f.modelCore,
    screenPackBuilder: ScreenPackBuilderCore.init({
      pack
    })
  }

  const inputsOpenPackBuilder: FixureUpdateInput[] = [
    {
      msgServer: {
        t: 'create-new-pack.created-pack',
        created: Ok(pack)
      }
    },
    {
      msg: {
        t: 'got-msg-core',
        c: {
          t: 'screen-pack-builder.user-opened-add-puzzle-screen',
          userId: f.ctx.currentUserId
        }
      }
    }
  ]

  return {
    ...f,
    ctx: ctxNew,
    inputsOpenPackBuilder,
    pack,
    puzzle,
    model,
    modelCore
  }
}

describe(import.meta.file, () => {
  it('should open puzzle when user clickes puzzle grid item', async () => {
    const ctx = await testFlowClientCtx()
    const puzzle = await createPuzzle(ctx)

    const output = andThen(
      initial,
      serverCreatedPack(ctx, await createPack(ctx)),
      clickedOpenPuzzlePickerButton(ctx),
      clickedPuzzlePickerItem(ctx, puzzle),
      clickedPuzzleGridItem(ctx, puzzle, 0)
    )
    const modelCore = deriveModelCore(ctx, output)
    expect(
      modelCore.screenPackBuilder?.screen.t === 'screen-puzzle' && modelCore.screenPackBuilder.screen.puzzleIndex === 0
    ).toBe(true)
  })

  it('should open puzzle picker when user clicks add puzzle button', async () => {
    const ctx = await testFlowClientCtx()
    const output = andThen(initial, serverCreatedPack(ctx, await createPack(ctx)), clickedOpenPuzzlePickerButton(ctx))
    const modelCore = deriveModelCore(ctx, output)
    expect(modelCore.screenPackBuilder?.screen.t === 'screen-add-puzzle').toBe(true)
  })

  it('should close puzzle picker when user clicks closes', async () => {
    const ctx = await testFlowClientCtx()
    const output = andThen(
      initial,
      serverCreatedPack(ctx, await createPack(ctx)),
      clickedOpenPuzzlePickerButton(ctx),
      closedPuzzlePickerDrawer(ctx)
    )
    const modelCore = deriveModelCore(ctx, output)
    expect(modelCore.screenPackBuilder?.screen.t === 'screen-puzzle-grid').toBe(true)
  })

  it('should add puzzle to the pack after clicking a puzzle in the picker', async () => {
    const ctx = await testFlowClientCtx()
    const puzzle = await createPuzzle(ctx)
    const output = andThen(initial, serverCreatedPack(ctx, await createPack(ctx)), clickedPuzzlePickerItem(ctx, puzzle))
    const modelCore = deriveModelCore(ctx, output)
    expect(modelCore.screenPackBuilder && Pack.includes(modelCore.screenPackBuilder.pack, puzzle.id)).toBe(true)
  })

  it('should close puzzle picker after adding a puzzle to the pack', async () => {
    const ctx = await testFlowClientCtx()
    const puzzle = await createPuzzle(ctx)
    const output = andThen(
      initial,
      serverCreatedPack(ctx, await createPack(ctx)),
      clickedOpenPuzzlePickerButton(ctx),
      clickedPuzzlePickerItem(ctx, puzzle)
    )
    const modelCore = deriveModelCore(ctx, output)
    expect(modelCore.screenPackBuilder?.screen.t === 'screen-puzzle-grid').toBe(true)
  })

  it('should go back to grid after exiting puzzle', async () => {
    const ctx = await testFlowClientCtx()
    const puzzle = await createPuzzle(ctx)
    const output = andThen(
      initial,
      serverCreatedPack(ctx, await createPack(ctx)),
      clickedOpenPuzzlePickerButton(ctx),
      clickedPuzzlePickerItem(ctx, puzzle),
      clickedPuzzleGridItem(ctx, puzzle, 0),
      clickedExitPuzzleButton(ctx)
    )
    const modelCore = deriveModelCore(ctx, output)
    expect(modelCore.screenPackBuilder?.screen.t === 'screen-puzzle-grid').toBe(true)
  })

  it('should open the more drawer after clicking "more" button', async () => {
    const f = await Fixture()
    const output = f.update(f.init, [
      ...f.inputsOpenPackBuilder,
      {
        msg: {
          t: 'got-msg-core',
          c: {
            t: 'screen-pack-builder.user-clicked-add-puzzle-item',
            puzzle: f.puzzle,
            userId: f.ctx.currentUserId
          }
        }
      },
      {
        msg: {
          t: 'got-msg-core',
          c: {
            t: 'screen-pack-builder.user-clicked-pack-item',
            puzzleResult: { t: 'got', c: f.puzzle },
            puzzleIndex: f.pack.puzzleIds.indexOf(f.puzzle.id)
          }
        }
      },
      {
        msg: {
          t: 'got-msg-core',
          c: {
            t: 'screen-pack-builder.puzzle-screen.user-clicked-more-button',
            userId: f.ctx.currentUserId
          }
        }
      }
    ])

    expect(
      output.modelCore.screenPackBuilder?.screen.t === 'screen-puzzle' &&
        output.modelCore.screenPackBuilder?.screen.opened === 'more'
    ).toBe(true)
  })

  it('should close the more drawer', async () => {
    const ctx = await testFlowClientCtx()
    const puzzle = await createPuzzle(ctx)
    const output = andThen(
      initial,
      serverCreatedPack(ctx, await createPack(ctx)),
      clickedOpenPuzzlePickerButton(ctx),
      clickedPuzzlePickerItem(ctx, puzzle),
      clickedPuzzleGridItem(ctx, puzzle, 0),
      clickedMoreButton(ctx),
      closedMoreDrawer(ctx)
    )
    const modelCore = deriveModelCore(ctx, output)
    expect(
      modelCore.screenPackBuilder?.screen.t === 'screen-puzzle' && modelCore.screenPackBuilder?.screen.opened === null
    ).toBe(true)
  })

  it('should should remove puzzle from pack clicking remove from pack button', async () => {
    const f = await Fixture()
    const puzzleIndex = f.pack.puzzleIds.indexOf(f.puzzle.id)
    const output = f.update(f.init, [
      ...f.inputsOpenPackBuilder,

      {
        msg: {
          t: 'got-msg-core',
          c: {
            t: 'remove-puzzle-from-pack.user-clicked-remove-from-pack-button',
            userId: f.ctx.currentUserId,
            puzzleIndex
          }
        }
      }
    ])
    expect(puzzleIndex).toBe(0)
    expect(output.modelCore.screenPackBuilder).toBeTruthy()
    expect(output.modelCore.screenPackBuilder?.pack.puzzleIds.includes(f.puzzle.id)).toBe(false)
  })

  it.todo('should update pack when pack changes in model sync', async () => {
    const f = await Fixture()
    const before = {
      ...f.ctx.packs[f.pack.id]
    }
    const updatedPack: Pack = {
      ...f.pack,
      puzzleIds: []
    }
    ScreenPackBuilderClient.update({
      ...f,
      modelCore: {
        ...f.modelCore,
        screenPackBuilder: ScreenPackBuilderCore.init({
          pack: updatedPack
        })
      }
    })
    // const after = {
    //   ...output.ctx.packs[f.pack.id]
    // }
    expect(before).toEqual(f.pack)
    // expect(after).toEqual(updatedPack)
  })
})
