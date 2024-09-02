import { NonEmpty, Ok } from 'gamezilla-app/@/core'
import { LamportTimestamp } from 'gamezilla-app/@/lamport-clock'
import { EventId } from 'gamezilla-app/app/spaces/@/event'
import type { SpaceClientCtx } from 'gamezilla-app/app/spaces/@/space'
import { testSpaceClientCtx } from '../../../../@/testing/client'
import { Flow } from '../../../@/flow'
import type { FlowClientCtx } from '../../../@/flow-client-ctx'
import { FlowPack } from '../../../@/flow-pack/flow-pack'
import { FlowPuzzle } from '../../../@/flow-puzzle/flow-puzzle'
import type { FlowPuzzleId } from '../../../@/flow-puzzle/flow-puzzle-id'
import { samples } from '../../../@/flow/flow-variant/flow-grid/flow-grid-samples'
import { BuilderClient } from '../../builder.client'
import { BuilderCore } from '../../builder.core'
import * as BuilderTypes from '../../builder.types'

import { FixtureSpaceClient } from 'gamezilla-app/app/spaces/@/testing/client'
import { FlowPuzzleList } from '../../../@/flow-puzzle'

type Input = {
  ctx?: FlowClientCtx
  msg: BuilderTypes.MsgClient
}
type Output = ReturnType<typeof BuilderClient.update> & {
  modelCore: BuilderTypes.ModelCore
}

const toModelCore = (
  ctx: FlowClientCtx,
  initial: BuilderTypes.ModelCore,
  msgCores: BuilderTypes.MsgCore[]
): BuilderTypes.ModelCore => {
  return msgCores.reduce(
    (modelCore, msgCore) =>
      BuilderCore.updateCore({
        ctx,
        modelCore,
        msgCore
      }),
    initial
  )
}

const updatesReducer = (initCtx: FlowClientCtx) => (outputs: NonEmpty<Output>, input: Input) => {
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
  inputs: Input[]
): NonEmpty<Output> => {
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
  inputs: Input[]
): Output => {
  const outputs = updates(init, inputs)
  return NonEmpty.last(outputs)
}

export const FixtureFlowBuilderClient = async () => {
  const f = await FixtureSpaceClient()
  const model = BuilderTypes.initClient
  const modelCore = BuilderCore.initCore({ ctx: f.ctx })
  const ctx: FlowClientCtx = {
    ...f.ctx,
    flowPuzzles: {},
    flowPacks: {},
    flowPuzzleList: FlowPuzzleList.initClient
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
    flowPacks: {},
    flowPuzzles: {},
    flowPuzzleList: FlowPuzzleList.initClient
  }
}

export const clickedPackCreateNewButton = (ctx: FlowClientCtx) => (model: BuilderTypes.ModelClient) => {
  return BuilderClient.update({
    model,
    ctx: ctx,
    modelCore: BuilderCore.initCore({
      ctx
    }),
    msg: {
      t: 'pack-create-new.clicked-create-button'
    }
  })
}

export const userCreatedPack = (ctx: FlowClientCtx, pack: FlowPack) => (model: BuilderTypes.ModelClient) => {
  return BuilderClient.update({
    model,
    ctx: ctx,
    modelCore: BuilderCore.initCore({
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

export const clickedPackItem = (ctx: FlowClientCtx, pack: FlowPack) => (model: BuilderTypes.ModelClient) => {
  return BuilderClient.update({
    model,
    ctx: ctx,
    modelCore: BuilderCore.initCore({
      ctx
    }),
    msg: {
      t: 'pack-list.clicked-pack-item',
      pack
    }
  })
}

export const clickedOpenPuzzlePickerButton =
  (ctx: FlowClientCtx, modelCore: BuilderTypes.ModelCore = BuilderCore.initCore({ ctx })) =>
  (model: BuilderTypes.ModelClient) => {
    return BuilderClient.update({
      model,
      msg: {
        t: 'screen-pack-builder.user-opened-add-puzzle-screen',
        userId: ctx.currentUserId
      },
      ctx,
      modelCore
    })
  }

export const closedPuzzlePickerDrawer = (ctx: FlowClientCtx) => (model: BuilderTypes.ModelClient) => {
  return BuilderClient.update({
    model,
    msg: {
      t: 'screen-pack-builder.user-closed-add-puzzle-screen'
    },
    ctx,
    modelCore: BuilderCore.initCore({
      ctx
    })
  })
}

export const clickedPuzzleListItem = (ctx: FlowClientCtx, puzzle: FlowPuzzle) => (model: BuilderTypes.ModelClient) => {
  return BuilderClient.update({
    model,
    msg: {
      t: 'builder-open-puzzle.clicked-puzzle-list-item',
      puzzle
    },
    ctx,
    modelCore: BuilderCore.initCore({
      ctx
    })
  })
}

export const clickedExitPuzzleBuilderButton =
  (ctx: FlowClientCtx, modelCore: BuilderTypes.ModelCore = BuilderCore.initCore({ ctx })) =>
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

export const serverListedPuzzlesOk =
  (ctx: FlowClientCtx, puzzles: FlowPuzzle[]) => (model: BuilderTypes.ModelClient) => {
    return BuilderClient.update({
      ctx: ctx,
      model,
      modelCore: BuilderCore.initCore({
        ctx
      }),
      msgServer: {
        t: 'flow-puzzle-list',
        c: {
          t: 'flow-puzzle-list.listed-puzzle',
          listed: Ok({
            items: puzzles,
            limit: 10,
            offset: 0,
            total: puzzles.length
          })
        }
      }
    })
  }

export const puzzleBuilderPressDownRandomNode =
  (ctx: FlowClientCtx, modelCore: BuilderTypes.ModelCore) => (model: BuilderTypes.ModelClient) => {
    const puzzleBuilder = modelCore.puzzleBuilder

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
      modelCore: BuilderCore.initCore({
        ctx
      })
    })
  }

export const puzzleBuilderUserSavedChanges =
  (ctx: FlowClientCtx, puzzle: FlowPuzzle) => (model: BuilderTypes.ModelClient) => {
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
      modelCore: BuilderCore.initCore({
        ctx
      })
    })
  }

export const clickedPuzzlePickerItem =
  (ctx: FlowClientCtx, puzzle: FlowPuzzle) => (model: BuilderTypes.ModelClient) => {
    return BuilderClient.update({
      model,
      msg: {
        t: 'screen-pack-builder.user-clicked-add-puzzle-item',
        puzzle,
        userId: ctx.currentUserId
      },
      ctx,
      modelCore: BuilderCore.initCore({
        ctx
      })
    })
  }

export const clickedExitPuzzleButton = (ctx: FlowClientCtx) => (model: BuilderTypes.ModelClient) => {
  return BuilderClient.update({
    model,
    msg: {
      t: 'screen-pack-builder.puzzle-screen.user-clicked-exit-puzzle',
      userId: ctx.currentUserId
    },
    ctx,
    modelCore: BuilderCore.initCore({
      ctx
    })
  })
}

export const clickedPuzzleGridItem =
  (ctx: FlowClientCtx, puzzle: FlowPuzzle, puzzleIndex: number) => (model: BuilderTypes.ModelClient) => {
    return BuilderClient.update({
      model,
      msg: {
        t: 'screen-pack-builder.user-clicked-pack-item',
        puzzle,
        puzzleIndex
      },
      ctx,
      modelCore: BuilderCore.initCore({
        ctx
      })
    })
  }

export const serverCreatedPack = (ctx: FlowClientCtx, pack: FlowPack) => (model: BuilderTypes.ModelClient) => {
  return BuilderClient.update({
    model,
    ctx: ctx,
    modelCore: BuilderCore.initCore({
      ctx
    }),
    msgServer: {
      t: 'pack-create-new.created-pack',
      created: Ok(pack)
    }
  })
}

export function createFlowPuzzle(ctx: SpaceClientCtx) {
  return FlowPuzzle.create({
    count: 1,
    createdAt: ctx.now,
    createdBy: ctx.currentUserId,
    flow: samples['5x5']['1']
  })
}

export function createFlowPack(ctx: SpaceClientCtx, puzzleIds: FlowPuzzleId[] = []) {
  return FlowPack.create({
    now: ctx.now,
    puzzleIds,
    count: 1,
    createdBy: ctx.currentUserId
  })
}
