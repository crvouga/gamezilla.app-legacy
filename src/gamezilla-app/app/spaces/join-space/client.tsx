import { APP_SOUND, playSound, showErrSm, showToast } from 'gamezilla-app/app/@/client'
import { Button } from 'gamezilla-app/app/@/ui'
import { SpaceClientModule } from '../@/architecture/space-client'
import { GameCoverArt } from '../games/game-cover-art'
import * as SpacesCoreClient from '../core/client/spaces-core.client'
import { ViewUsersInSpaceList } from '../games/@/game/users-in-space-list'
import { LayoutGameCoverArtHeader } from '../games/@/game/layout-game-cover-art-header'
import { withEventId } from 'gamezilla-app/@/event-sourced/event'
import { MsgCore } from '../core'

const update: SpaceClientModule['update'] = (input) => {
  return SpaceClientModule.andThen(
    { model: input.model },
    (model) => updateFromSpaceEvent({ ...input, model }),
    (model) => updateFromJoinSpaceButton({ ...input, model })
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

      const spaceEventNew = withEventId<MsgCore>({
        t: 'user-joined-space',
        spaceId: msg.spaceId,
        userId: currentUserId
      })

      return {
        model,
        msgCore: [spaceEventNew]
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
  const { msgCore: msgCore, model, ctx } = input

  if (!ctx.currentUserId) {
    return { model }
  }

  switch (msgCore?.t) {
    case 'user-joined-space': {
      const error = SpacesCoreClient.toErrorByEvenId(model, msgCore.eventId)

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

      if (msgCore.spaceId !== currentUserSpaceId) {
        return {
          model
        }
      }

      if (msgCore.userId !== ctx.currentUserId) {
        const username = ctx.profiles[msgCore.userId]?.username ?? null
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
  const space = input.ctx.space
  const currentUser = input.ctx.currentUser
  if (!space || !currentUser) {
    return null
  }

  const spaceState = SpacesCoreClient.toSpaceState(input.model, space.spaceId)

  if (spaceState.type !== 'started') {
    return null
  }

  return (
    <div className='flex h-full w-full flex-col overflow-hidden'>
      <LayoutGameCoverArtHeader
        ctx={input.ctx}
        onBack={() =>
          input.dispatch({
            t: 'clicked-go-home-button'
          })
        }
        title={spaceState.game ? input.ctx.t(spaceState.game.t) : input.ctx.t('spaces.space')}
        renderCoverArt={(inputCoverArt) =>
          spaceState.game && (
            <div {...inputCoverArt}>
              <GameCoverArt gameName={spaceState.game.t} />
            </div>
          )
        }
        renderContent={() => (
          <ViewUsersInSpaceList
            ctx={{
              ...input.ctx,
              space: space,
              currentUserId: currentUser.userId,
              currentUserRole: currentUser.role,
              currentUser
            }}
            onOpenUserDetails={(userId) =>
              input.dispatch({
                t: 'clicked-user',
                userId
              })
            }
          />
        )}
      />

      <div className='flex flex-row gap-4 border-t  p-4'>
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
