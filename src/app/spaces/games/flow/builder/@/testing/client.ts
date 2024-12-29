import { NonEmpty } from '~/@/array/non-empty'
import { Ok } from '~/@/core'
import { EventId, WithEventMeta } from '~/@/event-sourced/event'
import { LamportTimestamp } from '~/@/lamport-clock'
import { FixtureSpacesClient } from '~/app/spaces/@/fixture/client'
import { SpaceClientCtx } from '~/app/spaces/@/space-client-ctx'
import { testSpaceClientCtx } from '~/app/spaces/games/@/testing/client'
import type { FlowClientCtx } from '../../../@/client/ctx'
import { Flow } from '../../../@/flow'
import { samples } from '../../../@/flow/flow-variant/flow-grid/flow-grid-samples'
import { Pack } from '../../../@/pack/pack'
import { PackListTypes } from '../../../@/pack/pack-list'
import { PackPuzzlesGridTypes } from '../../../@/pack/pack-puzzles-grid'
import { Puzzle } from '../../../@/puzzle/puzzle'
import type { PuzzleId } from '../../../@/puzzle/puzzle-id'
import { PuzzleListTypes } from '../../../@/puzzle/puzzle-list'
import { BuilderClient } from '../../client'
import { BuilderCore } from '../../core'
import * as BuilderTypes from '../../types'

export type FixureUpdateInput = {
  ctx?: FlowClientCtx
  msg?: BuilderTypes.MsgClient
  msgCore?: WithEventMeta<BuilderTypes.MsgCore>
  msgServer?: BuilderTypes.MsgToClient
}
export type FixureUpdateOutput = ReturnType<typeof BuilderClient.update> & {
  modelCore: BuilderTypes.ModelCore
}

const toModelCore = (
  ctx: FlowClientCtx,
  initial: BuilderTypes.ModelCore,
  msgCores: BuilderTypes.MsgCore[]
): BuilderTypes.ModelCore => {
  return msgCores.reduce(
    (modelCore, msgCore) =>
      BuilderCore.update({
        ctx,
        modelCore,
        msgCore
      }),
    initial
  )
}

const updatesReducer =
  (initCtx: FlowClientCtx) => (outputs: NonEmpty<FixureUpdateOutput>, input: FixureUpdateInput) => {
    const ctx = input.ctx ?? initCtx
    const output = BuilderClient.update({
      ...input,
      model: NonEmpty.last(outputs).model,
      modelCore: NonEmpty.last(outputs).modelCore,
      ctx
    })
    const modelCoreOutput = toModelCore(ctx, NonEmpty.last(outputs).modelCore, output.msgCore ?? [])
    outputs.push({
      ...output,
      modelCore: modelCoreOutput
    })
    return outputs
  }

const updates = (
  init: {
    model: BuilderTypes.ModelClient
    ctx: FlowClientCtx
    modelCore: BuilderTypes.ModelCore
  },
  inputs: FixureUpdateInput[]
): NonEmpty<FixureUpdateOutput> => {
  return inputs.reduce(updatesReducer(init.ctx), [
    {
      model: init.model,
      modelCore: init.modelCore
    }
  ])
}
const update = (
  init: {
    model: BuilderTypes.ModelClient
    ctx: FlowClientCtx
    modelCore: BuilderTypes.ModelCore
  },
  inputs: FixureUpdateInput[]
): FixureUpdateOutput => {
  const outputs = updates(init, inputs)
  return NonEmpty.last(outputs)
}

export const FixtureFlowBuilderClient = async () => {
  const f = await FixtureSpacesClient()
  const model = BuilderTypes.initClient
  const modelCore = BuilderCore.init({ ctx: f.ctx })
  const ctx: FlowClientCtx = {
    ...f.ctx,
    puzzles: {},
    packs: {},
    puzzleList: PuzzleListTypes.initClient,
    packList: PackListTypes.initClient,
    packPuzzleGrid: PackPuzzlesGridTypes.initClient
  }
  const init = {
    ctx,
    model,
    modelCore
  }

  return {
    ...f,
    init,
    ctx,
    model,
    modelCore,
    update,
    updates
  }
}

export const initial = {
  model: BuilderTypes.initClient
}

export const testFlowClientCtx = async (): Promise<FlowClientCtx> => {
  return {
    ...(await testSpaceClientCtx()),
    packs: {},
    puzzles: {},
    puzzleList: PuzzleListTypes.initClient,
    packList: PackListTypes.initClient,
    packPuzzleGrid: PackPuzzlesGridTypes.initClient
  }
}

export const clickedPackCreateNewButton = (ctx: FlowClientCtx) => (model: BuilderTypes.ModelClient) => {
  return BuilderClient.update({
    model,
    ctx,
    modelCore: BuilderCore.init({ ctx }),
    msg: {
      t: 'create-new-pack.clicked-create-button'
    }
  })
}

export const userCreatedPack = (ctx: FlowClientCtx, pack: Pack) => (model: BuilderTypes.ModelClient) => {
  return BuilderClient.update({
    model,
    ctx: ctx,
    modelCore: BuilderCore.init({
      ctx
    }),
    msgCore: {
      t: 'user-created-pack',
      created: Ok(pack),
      eventId: EventId.generate(),
      happenedAt: LamportTimestamp.fromNumber(0),
      userId: ctx.currentUserId
    }
  })
}

export const clickedPackItem = (ctx: FlowClientCtx, pack: Pack) => (model: BuilderTypes.ModelClient) => {
  return BuilderClient.update({
    model,
    ctx: ctx,
    modelCore: BuilderCore.init({
      ctx
    }),
    msg: {
      t: 'got-msg-core',
      c: {
        t: 'screen-pack-builder-open.user-clicked-pack-item',
        pack,
        userId: ctx.currentUserId
      }
    }
  })
}

export const clickedOpenPuzzlePickerButton =
  (ctx: FlowClientCtx, modelCore: BuilderTypes.ModelCore = BuilderCore.init({ ctx })) =>
  (model: BuilderTypes.ModelClient) => {
    return BuilderClient.update({
      model,
      msg: {
        t: 'got-msg-core',
        c: {
          t: 'screen-pack-builder.user-opened-add-puzzle-screen',
          userId: ctx.currentUserId
        }
      },
      ctx,
      modelCore
    })
  }

export const closedPuzzlePickerDrawer = (ctx: FlowClientCtx) => (model: BuilderTypes.ModelClient) => {
  return BuilderClient.update({
    model,
    msg: {
      t: 'got-msg-core',
      c: {
        t: 'screen-pack-builder.user-closed-add-puzzle-screen'
      }
    },
    ctx,
    modelCore: BuilderCore.init({
      ctx
    })
  })
}

export const clickedPuzzleListItem = (ctx: FlowClientCtx, puzzle: Puzzle) => (model: BuilderTypes.ModelClient) => {
  return BuilderClient.update({
    model,
    msg: {
      t: 'got-msg-core',
      c: {
        t: 'screen-puzzle-builder-open.clicked-puzzle-list-item',
        puzzle,
        userId: ctx.currentUserId
      }
    },
    ctx,
    modelCore: BuilderCore.init({ ctx })
  })
}

export const clickedExitPuzzleBuilderButton =
  (ctx: FlowClientCtx, modelCore: BuilderTypes.ModelCore = BuilderCore.init({ ctx })) =>
  (model: BuilderTypes.ModelClient) => {
    return BuilderClient.update({
      model,
      msg: {
        t: 'screen-puzzle-builder.user-clicked-exit-button'
      },
      ctx,
      modelCore: modelCore
    })
  }

export const puzzleBuilderPressDownRandomNode =
  (ctx: FlowClientCtx, modelCore: BuilderTypes.ModelCore) => (model: BuilderTypes.ModelClient) => {
    const puzzleBuilder = modelCore.screenPuzzleBuilder

    if (!puzzleBuilder) {
      return {
        model
      }
    }

    const nodes = Object.values(Flow.toNodes(puzzleBuilder.puzzle.flow))

    const randomNode = nodes[Math.floor(Math.random() * nodes.length)]

    if (!randomNode) {
      return {
        model
      }
    }

    return BuilderClient.update({
      model,
      msg: {
        t: 'screen-puzzle-builder.got-flow-ui-edit-msg',
        c: {
          t: 'pressed-down-node',
          nodeId: randomNode.nodeId
        }
      },
      ctx,
      modelCore: BuilderCore.init({
        ctx
      })
    })
  }

export const puzzleBuilderUserSavedChanges =
  (ctx: FlowClientCtx, puzzle: Puzzle) => (model: BuilderTypes.ModelClient) => {
    return BuilderClient.update({
      model,
      msgCore: {
        t: 'screen-puzzle-builder.saved-puzzle',
        eventId: EventId.generate(),
        happenedAt: LamportTimestamp.fromNumber(0),
        saved: Ok(puzzle),
        userId: ctx.currentUserId
      },
      ctx,
      modelCore: BuilderCore.init({
        ctx
      })
    })
  }

export const clickedPuzzlePickerItem = (ctx: FlowClientCtx, puzzle: Puzzle) => (model: BuilderTypes.ModelClient) => {
  return BuilderClient.update({
    model,
    msg: {
      t: 'got-msg-core',
      c: {
        t: 'screen-pack-builder.user-clicked-add-puzzle-item',
        puzzle,
        userId: ctx.currentUserId
      }
    },
    ctx,
    modelCore: BuilderCore.init({
      ctx
    })
  })
}

export const clickedExitPuzzleButton = (ctx: FlowClientCtx) => (model: BuilderTypes.ModelClient) => {
  return BuilderClient.update({
    model,
    msg: {
      t: 'got-msg-core',
      c: {
        t: 'screen-pack-builder.puzzle-screen.user-clicked-exit-puzzle',
        userId: ctx.currentUserId
      }
    },
    ctx,
    modelCore: BuilderCore.init({
      ctx
    })
  })
}

export const clickedPuzzleGridItem =
  (ctx: FlowClientCtx, puzzle: Puzzle, puzzleIndex: number) => (model: BuilderTypes.ModelClient) => {
    return BuilderClient.update({
      model,
      msg: {
        t: 'got-msg-core',
        c: {
          t: 'screen-pack-builder.user-clicked-pack-item',
          puzzleResult: { t: 'got', c: puzzle },
          puzzleIndex
        }
      },
      ctx,
      modelCore: BuilderCore.init({
        ctx
      })
    })
  }

export const serverCreatedPack = (ctx: FlowClientCtx, pack: Pack) => (model: BuilderTypes.ModelClient) => {
  return BuilderClient.update({
    model,
    ctx: ctx,
    modelCore: BuilderCore.init({
      ctx
    }),
    msgServer: {
      t: 'create-new-pack.created-pack',
      created: Ok(pack)
    }
  })
}

export function createPuzzle(ctx: SpaceClientCtx) {
  return Puzzle.create({
    count: 1,
    createdAt: ctx.now,
    createdBy: ctx.currentUserId,
    flow: samples['5x5']['1']
  })
}

export function createPack(ctx: SpaceClientCtx, puzzleIds: PuzzleId[] = []) {
  return Pack.create({
    now: ctx.now,
    puzzleIds,
    count: 1,
    createdBy: ctx.currentUserId
  })
}
