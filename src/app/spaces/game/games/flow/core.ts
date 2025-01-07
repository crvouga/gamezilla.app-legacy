import type { WithEventMeta } from '~/@/event-sourced/event'
import type { SpaceCtx } from '~/app/spaces/@/space/ctx'
import { Solutions } from './@/solutions/solutions'
import { BuilderCore } from './builder/core'
import { PlayCore } from './play/core'
import type { ModelCore, MsgCore } from './types'
import { FlowCoreCtx } from './@/core/ctx'

const initCore = (input: { ctx: SpaceCtx }): ModelCore => {
  const solutions = Solutions.init
  const ctx: FlowCoreCtx = {
    ...input.ctx,
    solutions,
  }
  return {
    mode: 'none',
    solutions,
    builder: BuilderCore.initCore({ ctx }),
    play: PlayCore.initCore({ ctx }),
  }
}

const updateCore = (input: { ctx: SpaceCtx; msgCore: WithEventMeta<MsgCore>; modelCore: ModelCore }): ModelCore => {
  const ctx: FlowCoreCtx = {
    ...input.ctx,
    solutions: input.modelCore.solutions,
  }
  switch (input.msgCore.t) {
    case 'play': {
      const updated = PlayCore.updateCore({ ctx, msgCore: input.msgCore.c, modelCore: input.modelCore.play })

      switch (updated.event?.t) {
        case 'user-clicked-exit-mode-button': {
          return { ...input.modelCore, play: updated, mode: 'none' }
        }
        default: {
          return { ...input.modelCore, play: updated }
        }
      }
    }

    case 'builder': {
      const updated = BuilderCore.updateCore({ ctx, msgCore: input.msgCore.c, modelCore: input.modelCore.builder })

      switch (updated.event?.t) {
        case 'user-clicked-exit-mode-button': {
          return { ...input.modelCore, builder: updated, mode: 'none' }
        }
        default: {
          return { ...input.modelCore, builder: updated }
        }
      }
    }

    case 'user-changed-mode': {
      if (input.msgCore.userId !== ctx.space.hostId) {
        return input.modelCore
      }

      return {
        ...input.modelCore,
        mode: input.msgCore.mode,
        play: PlayCore.initCore({ ctx }),
        builder: BuilderCore.initCore({ ctx }),
      }
    }
  }
}

export const FlowCore = {
  initCore,
  updateCore,
}
