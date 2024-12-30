import { FeedItem } from '../../@/feed-item'
import { GamesClient } from '../../games/client'
import type { SpaceEvent } from '../../core'
import * as SpacesCoreClient from '../../core/client/spaces-core.client'
import type { ModelClient, MsgClient } from '../../types'
import { SpaceClientCtx } from '../../@/space-client-ctx'
import { WithEventId } from '~/@/event-sourced/event'
import { SpaceCoreState } from '../../core/space-state'

const View = ({
  spaceState,
  ctx,
  model
}: {
  spaceState: SpaceCoreState.State
  dispatch: (m: MsgClient) => void
  model: ModelClient
  ctx: SpaceClientCtx
}) => {
  const msgEvt =
    spaceState.type === 'started'
      ? SpacesCoreClient.toEventWithMeta(model, spaceState.spaceId, spaceState.latestEventId)
      : null

  return (
    <div className='flex h-6 w-full items-center justify-center border-b p-1'>
      {spaceState.type === 'started' && msgEvt ? <ViewFeedItem ctx={ctx} msgEvt={msgEvt} state={spaceState} /> : null}
    </div>
  )
}

const ViewFeedItem = ({
  ctx,
  msgEvt,
  state
}: {
  ctx: SpaceClientCtx
  msgEvt: WithEventId<SpaceEvent>
  state: SpaceCoreState.Started
}) => {
  switch (msgEvt.t) {
    case 'game': {
      if (!state.game) {
        return null
      }
      return (
        <GamesClient.ViewFeedItem
          ctx={ctx}
          msgCore={{
            ...msgEvt,
            ...msgEvt.c
          }}
          modelCore={state.game}
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
  View
}
