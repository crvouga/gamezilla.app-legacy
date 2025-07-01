import { v } from '~/@/vdom/v'
import { WithEventId } from '~/@/event-sourced/event'
import { SpaceFrontendCtx } from '~/app/spaces/@/frontend/ctx'
import { FeedItem } from '../../@/feed-item'
import { GamesFrontend } from '../../game/games/frontend'
import { MsgSpace } from '../../space/msg-space'
import { SpaceProjection } from '../../space/space'
import { Spaces } from '../../space/spaces'
import type { ModelFrontend, MsgFrontend } from '../../types'

const View = ({
  spaceState,
  ctx,
  model,
}: {
  spaceState: SpaceProjection.Model
  dispatch: (m: MsgFrontend) => void
  model: ModelFrontend
  ctx: SpaceFrontendCtx
}) => {
  const msgEvt =
    spaceState.type === 'started'
      ? Spaces.toEventWithMeta(model.spaces, spaceState.spaceId, spaceState.latestEventId)
      : null

  return v('div', { class: 'flex h-6 w-full items-center justify-center p-1' }, [
    spaceState.type === 'started' && msgEvt ? v(ViewFeedItem, { ctx, msgEvt, state: spaceState }) : null,
  ])
}

const ViewFeedItem = ({
  ctx,
  msgEvt,
  state,
}: {
  ctx: SpaceFrontendCtx
  msgEvt: WithEventId<MsgSpace>
  state: SpaceProjection.Started
}) => {
  switch (msgEvt.t) {
    case 'game': {
      if (!state.game) {
        return null
      }
      return v(GamesFrontend.ViewFeedItem, {
        ctx,
        msgSpace: {
          ...msgEvt,
          ...msgEvt.c,
        },
        modelSpace: state.game,
        dispatch: (_msg) => {
          //
        },
      })
    }

    case 'user-ended-space': {
      const profile = ctx.profilesByUserId[msgEvt.userId]
      return v(FeedItem.Info, { text: `${profile?.username ?? 'Someone'} ended the space` })
    }

    case 'user-inputted-game': {
      const profile = ctx.profilesByUserId[msgEvt.userId]
      if (!msgEvt.game) {
        return v(FeedItem.Info, { text: `${profile?.username ?? 'Someone'} quit the game` })
      }
      return v(FeedItem.Info, { text: `${profile?.username ?? 'Someone'} started a game` })
    }

    case 'user-joined-space': {
      const profile = ctx.profilesByUserId[msgEvt.userId]
      return v(FeedItem.Info, { text: `${profile?.username ?? 'Someone'} joined the space` })
    }

    case 'user-left-space': {
      const profile = ctx.profilesByUserId[msgEvt.userId]
      return v(FeedItem.Info, { text: `${profile?.username ?? 'Someone'} left the space` })
    }

    case 'user-started-space': {
      const profile = ctx.profilesByUserId[msgEvt.userId]
      return v(FeedItem.Info, { text: `${profile?.username ?? 'Someone'} started the space` })
    }

    default: {
      return null
    }
  }
}

export const Feed = {
  View,
}
