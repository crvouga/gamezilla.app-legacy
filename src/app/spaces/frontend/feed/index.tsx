import { WithEventId } from '~/@/event-sourced/event'
import { SpaceFrontendCtx } from '~/app/spaces/@/frontend/ctx'
import { FeedItem } from '../../@/feed-item'
import { SpacesCore } from '../../core/core'
import { MsgSpace } from '../../core/space-msg/space-msg'
import { SpaceState } from '../../core/space-state'
import { GamesFrontend } from '../../game/games/frontend'
import type { ModelFrontend, MsgFrontend } from '../../types'

const View = ({
  spaceState,
  ctx,
  model,
}: {
  spaceState: SpaceState.State
  dispatch: (m: MsgFrontend) => void
  model: ModelFrontend
  ctx: SpaceFrontendCtx
}) => {
  const msgEvt =
    spaceState.type === 'started'
      ? SpacesCore.toEventWithMeta(model.spaces, spaceState.spaceId, spaceState.latestEventId)
      : null

  return (
    <div className='flex h-6 w-full items-center justify-center p-1'>
      {spaceState.type === 'started' && msgEvt ? <ViewFeedItem ctx={ctx} msgEvt={msgEvt} state={spaceState} /> : null}
    </div>
  )
}

const ViewFeedItem = ({
  ctx,
  msgEvt,
  state,
}: {
  ctx: SpaceFrontendCtx
  msgEvt: WithEventId<MsgSpace>
  state: SpaceState.Started
}) => {
  switch (msgEvt.t) {
    case 'game': {
      if (!state.game) {
        return null
      }
      return (
        <GamesFrontend.ViewFeedItem
          ctx={ctx}
          msgSpace={{
            ...msgEvt,
            ...msgEvt.c,
          }}
          modelSpace={state.game}
          dispatch={(_msg) => {
            //
          }}
        />
      )
    }

    case 'user-ended-space': {
      const profile = ctx.profiles[msgEvt.userId]
      return <FeedItem.Info text={`${profile?.username ?? 'Someone'} ended the space`} />
    }

    case 'user-inputted-game': {
      const profile = ctx.profiles[msgEvt.userId]
      if (!msgEvt.game) {
        return <FeedItem.Info text={`${profile?.username ?? 'Someone'} quit the game`} />
      }
      return <FeedItem.Info text={`${profile?.username ?? 'Someone'} started a game`} />
    }

    case 'user-joined-space': {
      const profile = ctx.profiles[msgEvt.userId]
      return <FeedItem.Info text={`${profile?.username ?? 'Someone'} joined the space`} />
    }

    case 'user-left-space': {
      const profile = ctx.profiles[msgEvt.userId]
      return <FeedItem.Info text={`${profile?.username ?? 'Someone'} left the space`} />
    }

    case 'user-started-space': {
      const profile = ctx.profiles[msgEvt.userId]
      return <FeedItem.Info text={`${profile?.username ?? 'Someone'} started the space`} />
    }

    default: {
      return null
    }
  }
}

export const Feed = {
  View,
}
