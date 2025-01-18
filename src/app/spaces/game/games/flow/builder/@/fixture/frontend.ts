import { NonEmpty } from '~/@/array/non-empty'
import { EventId, WithEventMeta } from '~/@/event-sourced/event'
import { LamportTimestamp } from '~/@/lamport-clock'
import { Ok } from '~/@/result'
import { FixtureSpacesFrontend } from '~/app/spaces/@/fixture/frontend'
import { SpaceFrontendCtx } from '~/app/spaces/@/space-frontend/ctx'
import { testSpaceFrontendCtx } from '~/app/spaces/game/games/@/testing/frontend'
import { Flow } from '../../../@/flow'
import type { FlowFrontendCtx } from '../../../@/frontend/ctx'
import { Pack } from '../../../@/pack/pack'
import { PackDb } from '../../../@/pack/pack-db/impl'
import { PackListTypes } from '../../../@/pack/pack-list'
import { PackPuzzlesGridTypes } from '../../../@/pack/pack-puzzles-grid'
import { Puzzle } from '../../../@/puzzle/puzzle'
import { PuzzleDb } from '../../../@/puzzle/puzzle-db'
import type { PuzzleId } from '../../../@/puzzle/puzzle-id'
import { PuzzleListTypes } from '../../../@/puzzle/puzzle-list'
import { Solutions } from '../../../@/solutions/solutions'
import { samples } from '../../../@/variant/grid/grid-samples'
import { BuilderFrontend } from '../../frontend'
import { BuilderSpace } from '../../space'
import * as BuilderTypes from '../../types'

export type FixtureUpdateInput = {
  ctx?: FlowFrontendCtx
  msg?: BuilderTypes.MsgFrontend
  msgSpace?: WithEventMeta<BuilderTypes.MsgSpace>
  msgBackend?: BuilderTypes.MsgToFrontend
}
export type FixtureUpdateOutput = ReturnType<typeof BuilderFrontend.update> & {
  modelSpace: BuilderTypes.ModelSpace
}

const toModelSpace = (
  ctx: FlowFrontendCtx,
  initial: BuilderTypes.ModelSpace,
  msgSpaces: BuilderTypes.MsgSpace[],
): BuilderTypes.ModelSpace => {
  return msgSpaces.reduce(
    (modelSpace, msgSpace) =>
      BuilderSpace.updateSpace({
        ctx,
        modelSpace,
        msgSpace,
      }),
    initial,
  )
}

const updatesReducer =
  (initCtx: FlowFrontendCtx) => (outputs: NonEmpty<FixtureUpdateOutput>, input: FixtureUpdateInput) => {
    const ctx = input.ctx ?? initCtx
    const output = BuilderFrontend.update({
      ...input,
      model: NonEmpty.last(outputs).model,
      modelSpace: NonEmpty.last(outputs).modelSpace,
      ctx,
    })
    const modelSpaceOutput = toModelSpace(ctx, NonEmpty.last(outputs).modelSpace, output.msgSpace ?? [])
    outputs.push({
      ...output,
      modelSpace: modelSpaceOutput,
    })
    return outputs
  }

const updates = (
  init: {
    model: BuilderTypes.ModelFrontend
    ctx: FlowFrontendCtx
    modelSpace: BuilderTypes.ModelSpace
  },
  inputs: FixtureUpdateInput[],
): NonEmpty<FixtureUpdateOutput> => {
  return inputs.reduce(updatesReducer(init.ctx), [
    {
      model: init.model,
      modelSpace: init.modelSpace,
    },
  ])
}
const update = (
  init: {
    model: BuilderTypes.ModelFrontend
    ctx: FlowFrontendCtx
    modelSpace: BuilderTypes.ModelSpace
  },
  inputs: FixtureUpdateInput[],
): FixtureUpdateOutput => {
  const outputs = updates(init, inputs)
  return NonEmpty.last(outputs)
}

export const FixtureFlowBuilderFrontend = async () => {
  const f = await FixtureSpacesFrontend()
  const ctx: FlowFrontendCtx = {
    ...f.ctx,
    puzzles: {},
    packs: {},
    puzzleList: PuzzleListTypes.initFrontend,
    packList: PackListTypes.initFrontend,
    packPuzzleGrid: PackPuzzlesGridTypes.initFrontend,
    solutions: Solutions.init,
    puzzleDb: PuzzleDb({ t: 'db-conn-sql', dbConnSql: f.ctx.dbConnSql, logger: f.ctx.logger }),
    packDb: PackDb({ t: 'db-conn-sql', dbConnSql: f.ctx.dbConnSql, logger: f.ctx.logger }),
  }
  const model = BuilderTypes.initFrontend
  const modelSpace = BuilderSpace.initSpace({ ctx })
  const init = {
    ctx,
    model,
    modelSpace,
  }

  return {
    ...f,
    init,
    ctx,
    model,
    modelSpace,
    update,
    updates,
  }
}

export const initial = {
  model: BuilderTypes.initFrontend,
}

export const testFlowFrontendCtx = async (): Promise<FlowFrontendCtx> => {
  return {
    ...(await testSpaceFrontendCtx()),
    puzzleDb: PuzzleDb({ t: 'hash-map' }),
    packDb: PackDb({ t: 'hash-map' }),
    packs: {},
    puzzles: {},
    puzzleList: PuzzleListTypes.initFrontend,
    packList: PackListTypes.initFrontend,
    packPuzzleGrid: PackPuzzlesGridTypes.initFrontend,
    solutions: Solutions.init,
  }
}

export const clickedPackCreateNewButton = (ctx: FlowFrontendCtx) => (model: BuilderTypes.ModelFrontend) => {
  return BuilderFrontend.update({
    model,
    ctx,
    modelSpace: BuilderSpace.initSpace({ ctx }),
    msg: {
      t: 'create-new-pack.clicked-create-button',
    },
  })
}

export const userCreatedPack = (ctx: FlowFrontendCtx, pack: Pack) => (model: BuilderTypes.ModelFrontend) => {
  return BuilderFrontend.update({
    model,
    ctx: ctx,
    modelSpace: BuilderSpace.initSpace({
      ctx,
    }),
    msgSpace: {
      t: 'user-created-pack',
      created: Ok(pack),
      eventId: EventId.generate(),
      happenedAt: LamportTimestamp.fromNumber(0),
      userId: ctx.currentUserId,
    },
  })
}

export const clickedPackItem = (ctx: FlowFrontendCtx, pack: Pack) => (model: BuilderTypes.ModelFrontend) => {
  return BuilderFrontend.update({
    model,
    ctx: ctx,
    modelSpace: BuilderSpace.initSpace({
      ctx,
    }),
    msg: {
      t: 'got-msg-space',
      c: {
        t: 'screen-pack-builder-open.user-clicked-pack-item',
        pack,
        userId: ctx.currentUserId,
      },
    },
  })
}

export const clickedOpenPuzzlePickerButton =
  (ctx: FlowFrontendCtx, modelSpace: BuilderTypes.ModelSpace = BuilderSpace.initSpace({ ctx })) =>
  (model: BuilderTypes.ModelFrontend) => {
    return BuilderFrontend.update({
      model,
      msg: {
        t: 'got-msg-space',
        c: {
          t: 'screen-pack-builder.user-opened-add-puzzle-screen',
          userId: ctx.currentUserId,
        },
      },
      ctx,
      modelSpace,
    })
  }

export const closedPuzzlePickerDrawer = (ctx: FlowFrontendCtx) => (model: BuilderTypes.ModelFrontend) => {
  return BuilderFrontend.update({
    model,
    msg: {
      t: 'got-msg-space',
      c: {
        t: 'screen-pack-builder.user-closed-add-puzzle-screen',
      },
    },
    ctx,
    modelSpace: BuilderSpace.initSpace({
      ctx,
    }),
  })
}

export const clickedPuzzleListItem = (ctx: FlowFrontendCtx, puzzle: Puzzle) => (model: BuilderTypes.ModelFrontend) => {
  return BuilderFrontend.update({
    model,
    msg: {
      t: 'got-msg-space',
      c: {
        t: 'screen-puzzle-builder-open.clicked-puzzle-list-item',
        puzzle,
        userId: ctx.currentUserId,
      },
    },
    ctx,
    modelSpace: BuilderSpace.initSpace({ ctx }),
  })
}

export const clickedExitPuzzleBuilderButton =
  (ctx: FlowFrontendCtx, modelSpace: BuilderTypes.ModelSpace = BuilderSpace.initSpace({ ctx })) =>
  (model: BuilderTypes.ModelFrontend) => {
    return BuilderFrontend.update({
      model,
      msg: {
        t: 'screen-puzzle-builder.user-clicked-exit-button',
      },
      ctx,
      modelSpace: modelSpace,
    })
  }

export const puzzleBuilderPressDownRandomNode =
  (ctx: FlowFrontendCtx, modelSpace: BuilderTypes.ModelSpace) => (model: BuilderTypes.ModelFrontend) => {
    const puzzleBuilder = modelSpace.screenPuzzleBuilder

    if (!puzzleBuilder) {
      return {
        model,
      }
    }

    const nodes = Object.values(Flow.toNodes(puzzleBuilder.puzzle.flow))

    const randomNode = nodes[Math.floor(Math.random() * nodes.length)]

    if (!randomNode) {
      return {
        model,
      }
    }

    return BuilderFrontend.update({
      model,
      msg: {
        t: 'screen-puzzle-builder.got-edit-msg',
        c: {
          t: 'pressed-down-node',
          nodeId: randomNode.nodeId,
        },
      },
      ctx,
      modelSpace: BuilderSpace.initSpace({
        ctx,
      }),
    })
  }

export const puzzleBuilderUserSavedChanges =
  (ctx: FlowFrontendCtx, puzzle: Puzzle) => (model: BuilderTypes.ModelFrontend) => {
    return BuilderFrontend.update({
      model,
      msgSpace: {
        t: 'screen-puzzle-builder.saved-puzzle',
        eventId: EventId.generate(),
        happenedAt: LamportTimestamp.fromNumber(0),
        saved: Ok(puzzle),
        userId: ctx.currentUserId,
      },
      ctx,
      modelSpace: BuilderSpace.initSpace({
        ctx,
      }),
    })
  }

export const clickedPuzzlePickerItem =
  (ctx: FlowFrontendCtx, puzzle: Puzzle) => (model: BuilderTypes.ModelFrontend) => {
    return BuilderFrontend.update({
      model,
      msg: {
        t: 'got-msg-space',
        c: {
          t: 'screen-pack-builder.user-clicked-add-puzzle-item',
          puzzle,
          userId: ctx.currentUserId,
        },
      },
      ctx,
      modelSpace: BuilderSpace.initSpace({
        ctx,
      }),
    })
  }

export const clickedExitPuzzleButton = (ctx: FlowFrontendCtx) => (model: BuilderTypes.ModelFrontend) => {
  return BuilderFrontend.update({
    model,
    msg: {
      t: 'got-msg-space',
      c: {
        t: 'screen-pack-builder.puzzle-screen.user-clicked-exit-puzzle',
        userId: ctx.currentUserId,
      },
    },
    ctx,
    modelSpace: BuilderSpace.initSpace({
      ctx,
    }),
  })
}

export const clickedPuzzleGridItem =
  (ctx: FlowFrontendCtx, puzzle: Puzzle, puzzleIndex: number) => (model: BuilderTypes.ModelFrontend) => {
    return BuilderFrontend.update({
      model,
      msg: {
        t: 'got-msg-space',
        c: {
          t: 'screen-pack-builder.user-clicked-pack-item',
          puzzleResult: { t: 'got', c: puzzle },
          puzzleIndex,
        },
      },
      ctx,
      modelSpace: BuilderSpace.initSpace({
        ctx,
      }),
    })
  }

export const backendCreatedPack = (ctx: FlowFrontendCtx, pack: Pack) => (model: BuilderTypes.ModelFrontend) => {
  return BuilderFrontend.update({
    model,
    ctx: ctx,
    modelSpace: BuilderSpace.initSpace({
      ctx,
    }),
    msgBackend: {
      t: 'create-new-pack.created-pack',
      created: Ok(pack),
    },
  })
}

export function createPuzzle(ctx: SpaceFrontendCtx) {
  return Puzzle.create({
    count: 1,
    createdAt: ctx.now,
    createdBy: ctx.currentUserId,
    flow: samples['5x5']['1'],
  })
}

export function createPack(ctx: SpaceFrontendCtx, puzzleIds: PuzzleId[] = []) {
  return Pack.create({
    now: ctx.now,
    puzzleIds,
    count: 1,
    createdBy: ctx.currentUserId,
  })
}
