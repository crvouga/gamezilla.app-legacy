import type { WithEventId } from '../../@/event'
import { FeedItem } from '../../@/feed-item'
import type { SpaceClientCtx } from '../../@/space'
import { GameClient } from '../../game/game.client'
import type { MsgCore, SpaceCoreState } from '../../spaces-core'
import * as SpacesCoreClient from '../../spaces-core/spaces-core-client/spaces-core.client'
import type { ModelClient, MsgClient } from '../../spaces.types'

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
      ? SpacesCoreClient.toEventWithMeta(model, spaceState.spaceId, spaceState.latestEvent)
      : null

  return (
    <div className='flex h-6 w-full items-center justify-center border-b border-neutral-600 p-1'>
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
  msgEvt: WithEventId<MsgCore>
  state: SpaceCoreState.Started
}) => {
  switch (msgEvt.t) {
    case 'game': {
      if (!state.game) {
        return null
      }
      return (
        <GameClient.ViewFeedItem
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
