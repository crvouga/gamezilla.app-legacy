import type { WithEventMeta } from '~/@/event-sourced/event'
import type { SpaceCtx } from '~/app/spaces/@/space/ctx'
import { Solutions } from './@/solutions/solutions'
import { BuilderSpace } from './builder/space'
import { PlaySpace } from './play/space'
import type { ModelSpace, MsgSpace } from './types'
import { FlowSpaceCtx } from './@/space/ctx'

const initSpace = (input: { ctx: SpaceCtx }): ModelSpace => {
  const solutions = Solutions.init
  const ctx: FlowSpaceCtx = {
    ...input.ctx,
    solutions,
  }
  return {
    mode: 'none',
    solutions,
    builder: BuilderSpace.initSpace({ ctx }),
    play: PlaySpace.initSpace({ ctx }),
  }
}

const updateSpace = (input: {
  ctx: SpaceCtx
  msgSpace: WithEventMeta<MsgSpace>
  modelSpace: ModelSpace
}): ModelSpace => {
  const ctx: FlowSpaceCtx = {
    ...input.ctx,
    solutions: input.modelSpace.solutions,
  }
  switch (input.msgSpace.t) {
    case 'play': {
      const updated = PlaySpace.updateSpace({ ctx, msgSpace: input.msgSpace.c, modelSpace: input.modelSpace.play })

      switch (updated.event?.t) {
        case 'user-clicked-exit-mode-button': {
          return { ...input.modelSpace, play: updated, mode: 'none' }
        }
        default: {
          return { ...input.modelSpace, play: updated }
        }
      }
    }

    case 'builder': {
      const updated = BuilderSpace.updateSpace({
        ctx,
        msgSpace: input.msgSpace.c,
        modelSpace: input.modelSpace.builder,
      })

      switch (updated.event?.t) {
        case 'user-clicked-exit-mode-button': {
          return { ...input.modelSpace, builder: updated, mode: 'none' }
        }
        default: {
          return { ...input.modelSpace, builder: updated }
        }
      }
    }

    case 'user-changed-mode': {
      if (input.msgSpace.userId !== ctx.space.hostId) {
        return input.modelSpace
      }

      return {
        ...input.modelSpace,
        mode: input.msgSpace.mode,
        play: PlaySpace.initSpace({ ctx }),
        builder: BuilderSpace.initSpace({ ctx }),
      }
    }
  }
}

export const FlowSpace = {
  initSpace,
  updateSpace,
}
