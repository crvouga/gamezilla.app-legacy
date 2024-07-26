import { APP_SOUND, playSound, showErrSm, showToast } from 'gamezilla-app/app/@/client'
import { Button, TopBar } from 'gamezilla-app/app/@/ui'
import { withId } from '../@/event'
import { SpaceClientModule } from '../architecture/architecture'
import { ViewGameHeader, ViewUsersInSpaceList } from '../game/@/game'
import { CoverArt } from '../game/game-cover-art'
import type { SpaceCoreEvent } from '../spaces-core'
import * as SpacesCoreClient from '../spaces-core/spaces-core.client'

const update: SpaceClientModule['update'] = (input) => {
  return SpaceClientModule.andThen(
    { model: input.model },
    (model) =>
      updateFromSpaceEvent({
        ...input,
        model
      }),
    (model) =>
      updateFromJoinSpaceButton({
        ...input,
        model
      })
  )
}

const updateFromJoinSpaceButton: SpaceClientModule['update'] = ({ msg, model, ctx }) => {
  switch (msg?.t) {
    case 'clicked-join-space-button': {
      const currentUserId = ctx.currentUserId

      if (!currentUserId) {
        return {
          model
        }
      }

      const spaceEventNew = withId<SpaceCoreEvent>({
        t: 'user-joined-space',
        spaceId: msg.spaceId,
        userId: currentUserId
      })

      return {
        model,
        msgSpaceEvent: [spaceEventNew]
      }
    }
    default: {
      return {
        model
      }
    }
  }
}

const updateFromSpaceEvent: SpaceClientModule['update'] = (input) => {
  const { msgSpaceEvent, model, ctx } = input

  if (!ctx.currentUserId) {
    return { model }
  }

  switch (msgSpaceEvent?.t) {
    case 'user-joined-space': {
      const error = SpacesCoreClient.toErrorByEvenId(model, msgSpaceEvent.eventId)

      switch (error?.t) {
        case 'user-already-in-a-space': {
          if (error.userId === ctx.currentUserId) {
            return {
              model,
              msgCmd: showErrSm(ctx.t("spaces.you're-already-in-a-space"))
            }
          }

          return {
            model
          }
        }
      }

      const currentUserSpaceId = SpacesCoreClient.toSpaceIdByUserId(model, ctx.currentUserId)

      if (msgSpaceEvent.spaceId !== currentUserSpaceId) {
        return {
          model
        }
      }

      if (msgSpaceEvent.userId !== ctx.currentUserId) {
        const username = ctx.profiles[msgSpaceEvent.userId]?.username ?? null
        return {
          model,
          msgCmd: [
            playSound(APP_SOUND.navForward),
            username
              ? showToast(ctx.t('spaces.other-user-joined-space', username))
              : showToast(ctx.t('spaces.current-user-joined-space'))
          ]
        }
      }

      return {
        model,
        msgCmd: [playSound(APP_SOUND.navForward), showToast(ctx.t('spaces.current-user-joined-space'))]
      }
    }

    default: {
      return {
        model
      }
    }
  }
}

const View: SpaceClientModule['View'] = (input) => {
  if (!input.ctx.space || !input.ctx.currentUserId || !input.ctx.currentUserRole) {
    return null
  }

  const spaceState = SpacesCoreClient.toSpaceState(input.model, input.ctx.space.spaceId)

  if (spaceState.type !== 'started') {
    return null
  }

  return (
    <div className='flex h-full w-full flex-col'>
      <TopBar
        onBack={() =>
          input.dispatch({
            t: 'clicked-go-home-button'
          })
        }
        ctx={input.ctx}
        center
        title={input.ctx.t('spaces.space')}
      />

      <div className='flex w-full flex-1 flex-col overflow-y-scroll'>
        {spaceState.game && (
          <ViewGameHeader
            ctx={input.ctx}
            onBack={() =>
              input.dispatch({
                t: 'clicked-go-home-button'
              })
            }
            title={input.ctx.t(spaceState.game.t)}
            renderCoverArt={(inputCoverArt) =>
              spaceState.game && (
                <div {...inputCoverArt}>
                  <CoverArt gameName={spaceState.game.t} />
                </div>
              )
            }
          />
        )}

        <ViewUsersInSpaceList
          ctx={{
            ...input.ctx,
            currentUserId: input.ctx.currentUserId,
            currentUserRole: input.ctx.currentUserRole,
            space: input.ctx.space
          }}
          onOpenUserDetails={(userId) =>
            input.dispatch({
              t: 'clicked-user',
              userId
            })
          }
        />
      </div>

      <div className='flex flex-row gap-4 border-t border-neutral-700 p-4'>
        <Button
          className='flex-1'
          variant='contained'
          color='primary'
          onClick={() => {
            const spaceId = input.ctx.space?.spaceId
            if (!spaceId) {
              return
            }
            input.dispatch({
              t: 'clicked-join-space-button',
              spaceId
            })
          }}
          text={input.ctx.t('spaces.join-space')}
        />
      </div>
    </div>
  )
}

//
//
//
//
//
//
//

export const JoinSpaceClient = {
  View,
  update
}
