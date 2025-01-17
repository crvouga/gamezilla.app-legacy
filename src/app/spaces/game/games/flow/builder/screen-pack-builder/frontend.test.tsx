import { describe, expect, it } from 'bun:test'
import { Ok } from '~/@/result'
import { GameFrontendModule } from '~/app/spaces/game/games/@/architecture/game-frontend-v2'
import type { FlowFrontendCtx } from '../../@/frontend/ctx'
import { Pack } from '../../@/pack/pack'
import { Puzzle } from '../../@/puzzle/puzzle'
import {
  FixtureFlowBuilderFrontend,
  FixtureUpdateInput,
  clickedExitPuzzleButton,
  clickedOpenPuzzlePickerButton,
  clickedPuzzleGridItem,
  clickedPuzzlePickerItem,
  closedPuzzlePickerDrawer,
  createPack,
  createPuzzle,
  initial,
  backendCreatedPack,
  testFlowFrontendCtx,
} from '../@/fixture/frontend'
import { deriveModelSpace } from '../@/fixture/space'
import { BuilderSpace } from '../space'
import type { ModelFrontend, ModelSpace } from '../types'
import { ScreenPackBuilderFrontend } from './frontend'
import { ScreenPackBuilderSpace } from './space'

const clickedMoreButton = (ctx: FlowFrontendCtx) => (model: ModelFrontend) => {
  return ScreenPackBuilderFrontend.update({
    ctx,
    model,
    modelSpace: BuilderSpace.initSpace({ ctx }),
    msg: {
      t: 'got-msg-space',
      c: {
        t: 'screen-pack-builder.puzzle-screen.user-clicked-more-button',
        userId: ctx.currentUserId,
      },
    },
  })
}

const closedMoreDrawer = (ctx: FlowFrontendCtx) => (model: ModelFrontend) => {
  return ScreenPackBuilderFrontend.update({
    ctx,
    model,
    modelSpace: BuilderSpace.initSpace({ ctx }),
    msg: {
      t: 'got-msg-space',
      c: {
        t: 'screen-pack-builder.puzzle-screen.user-closed-more-drawer',
        userId: ctx.currentUserId,
      },
    },
  })
}

export const Fixture = async () => {
  const f = await FixtureFlowBuilderFrontend()
  const puzzle = await Puzzle.random({
    createdBy: f.ctx.currentUserId,
  })
  const pack = await Pack.random({
    createdBy: f.ctx.currentUserId,
    puzzleIds: [puzzle.id],
  })
  const ctxNew: typeof f.ctx = {
    ...f.ctx,
    puzzles: {
      ...f.ctx.puzzles,
      [puzzle.id]: puzzle,
    },
    packs: {
      ...f.ctx.packs,
      [pack.id]: pack,
    },
  }
  const model: ModelFrontend = {
    ...f.model,
  }
  const modelSpace: ModelSpace = {
    ...f.modelSpace,
    screenPackBuilder: ScreenPackBuilderSpace.init({
      pack,
    }),
  }

  const inputsOpenPackBuilder: FixtureUpdateInput[] = [
    {
      msgBackend: {
        t: 'create-new-pack.created-pack',
        created: Ok(pack),
      },
    },
    {
      msg: {
        t: 'got-msg-space',
        c: {
          t: 'screen-pack-builder.user-opened-add-puzzle-screen',
          userId: f.ctx.currentUserId,
        },
      },
    },
  ]

  return {
    ...f,
    ctx: ctxNew,
    inputsOpenPackBuilder,
    pack,
    puzzle,
    model,
    modelSpace,
  }
}

describe(import.meta.file, () => {
  it('should open puzzle when user clickes puzzle grid item', async () => {
    const ctx = await testFlowFrontendCtx()
    const puzzle = await createPuzzle(ctx)

    const output = GameFrontendModule.andThen(
      initial,
      backendCreatedPack(ctx, await createPack(ctx)),
      clickedOpenPuzzlePickerButton(ctx),
      clickedPuzzlePickerItem(ctx, puzzle),
      clickedPuzzleGridItem(ctx, puzzle, 0),
    )
    const modelSpace = deriveModelSpace(ctx, output)
    expect(
      modelSpace.screenPackBuilder?.screen.t === 'screen-puzzle' &&
        modelSpace.screenPackBuilder.screen.puzzleIndex === 0,
    ).toBe(true)
  })

  it('should open puzzle picker when user clicks add puzzle button', async () => {
    const ctx = await testFlowFrontendCtx()
    const output = GameFrontendModule.andThen(
      initial,
      backendCreatedPack(ctx, await createPack(ctx)),
      clickedOpenPuzzlePickerButton(ctx),
    )
    const modelSpace = deriveModelSpace(ctx, output)
    expect(modelSpace.screenPackBuilder?.screen.t === 'screen-add-puzzle').toBe(true)
  })

  it('should close puzzle picker when user clicks closes', async () => {
    const ctx = await testFlowFrontendCtx()
    const output = GameFrontendModule.andThen(
      initial,
      backendCreatedPack(ctx, await createPack(ctx)),
      clickedOpenPuzzlePickerButton(ctx),
      closedPuzzlePickerDrawer(ctx),
    )
    const modelSpace = deriveModelSpace(ctx, output)
    expect(modelSpace.screenPackBuilder?.screen.t === 'screen-puzzle-grid').toBe(true)
  })

  it('should add puzzle to the pack after clicking a puzzle in the picker', async () => {
    const ctx = await testFlowFrontendCtx()
    const puzzle = await createPuzzle(ctx)
    const output = GameFrontendModule.andThen(
      initial,
      backendCreatedPack(ctx, await createPack(ctx)),
      clickedPuzzlePickerItem(ctx, puzzle),
    )
    const modelSpace = deriveModelSpace(ctx, output)
    expect(modelSpace.screenPackBuilder && Pack.includes(modelSpace.screenPackBuilder.pack, puzzle.id)).toBe(true)
  })

  it('should close puzzle picker after adding a puzzle to the pack', async () => {
    const ctx = await testFlowFrontendCtx()
    const puzzle = await createPuzzle(ctx)
    const output = GameFrontendModule.andThen(
      initial,
      backendCreatedPack(ctx, await createPack(ctx)),
      clickedOpenPuzzlePickerButton(ctx),
      clickedPuzzlePickerItem(ctx, puzzle),
    )
    const modelSpace = deriveModelSpace(ctx, output)
    expect(modelSpace.screenPackBuilder?.screen.t === 'screen-puzzle-grid').toBe(true)
  })

  it('should go back to grid after exiting puzzle', async () => {
    const ctx = await testFlowFrontendCtx()
    const puzzle = await createPuzzle(ctx)
    const output = GameFrontendModule.andThen(
      initial,
      backendCreatedPack(ctx, await createPack(ctx)),
      clickedOpenPuzzlePickerButton(ctx),
      clickedPuzzlePickerItem(ctx, puzzle),
      clickedPuzzleGridItem(ctx, puzzle, 0),
      clickedExitPuzzleButton(ctx),
    )
    const modelSpace = deriveModelSpace(ctx, output)
    expect(modelSpace.screenPackBuilder?.screen.t === 'screen-puzzle-grid').toBe(true)
  })

  it('should open the more drawer after clicking "more" button', async () => {
    const f = await Fixture()
    const output = f.update(f.init, [
      ...f.inputsOpenPackBuilder,
      {
        msg: {
          t: 'got-msg-space',
          c: {
            t: 'screen-pack-builder.user-clicked-add-puzzle-item',
            puzzle: f.puzzle,
            userId: f.ctx.currentUserId,
          },
        },
      },
      {
        msg: {
          t: 'got-msg-space',
          c: {
            t: 'screen-pack-builder.user-clicked-pack-item',
            puzzleResult: { t: 'got', c: f.puzzle },
            puzzleIndex: f.pack.puzzleIds.indexOf(f.puzzle.id),
          },
        },
      },
      {
        msg: {
          t: 'got-msg-space',
          c: {
            t: 'screen-pack-builder.puzzle-screen.user-clicked-more-button',
            userId: f.ctx.currentUserId,
          },
        },
      },
    ])

    expect(
      output.modelSpace.screenPackBuilder?.screen.t === 'screen-puzzle' &&
        output.modelSpace.screenPackBuilder?.screen.opened === 'more',
    ).toBe(true)
  })

  it('should close the more drawer', async () => {
    const ctx = await testFlowFrontendCtx()
    const puzzle = await createPuzzle(ctx)
    const output = GameFrontendModule.andThen(
      initial,
      backendCreatedPack(ctx, await createPack(ctx)),
      clickedOpenPuzzlePickerButton(ctx),
      clickedPuzzlePickerItem(ctx, puzzle),
      clickedPuzzleGridItem(ctx, puzzle, 0),
      clickedMoreButton(ctx),
      closedMoreDrawer(ctx),
    )
    const modelSpace = deriveModelSpace(ctx, output)
    expect(
      modelSpace.screenPackBuilder?.screen.t === 'screen-puzzle' &&
        modelSpace.screenPackBuilder?.screen.opened === null,
    ).toBe(true)
  })

  it('should should remove puzzle from pack clicking remove from pack button', async () => {
    const f = await Fixture()
    const puzzleIndex = f.pack.puzzleIds.indexOf(f.puzzle.id)
    const output = f.update(f.init, [
      ...f.inputsOpenPackBuilder,

      {
        msg: {
          t: 'got-msg-space',
          c: {
            t: 'remove-puzzle-from-pack.user-clicked-remove-from-pack-button',
            userId: f.ctx.currentUserId,
            puzzleIndex,
          },
        },
      },
    ])
    expect(puzzleIndex).toBe(0)
    expect(output.modelSpace.screenPackBuilder).toBeTruthy()
    expect(output.modelSpace.screenPackBuilder?.pack.puzzleIds.includes(f.puzzle.id)).toBe(false)
  })

  it.todo('should update pack when pack changes in model sync', async () => {
    const f = await Fixture()
    const before = {
      ...f.ctx.packs[f.pack.id],
    }
    const updatedPack: Pack = {
      ...f.pack,
      puzzleIds: [],
    }
    ScreenPackBuilderFrontend.update({
      ...f,
      modelSpace: {
        ...f.modelSpace,
        screenPackBuilder: ScreenPackBuilderSpace.init({
          pack: updatedPack,
        }),
      },
    })
    // const after = {
    //   ...output.ctx.packs[f.pack.id]
    // }
    expect(before).toEqual(f.pack)
    // expect(after).toEqual(updatedPack)
  })
})
