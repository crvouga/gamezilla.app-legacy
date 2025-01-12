import { withEventId } from '~/@/event-sourced/event'
import { APP_SOUND, playSound, showErrSm, showToast } from '~/app/@/frontend/cmd'
import { Button } from '~/app/@/ui'
import { SpaceFrontendModule } from '../@/architecture/space-frontend'
import { SpacesCoreFrontend } from '../core/frontend'
import { SpaceEvent } from '../core/space-event'
import { LayoutGameCoverArtHeader } from '../game/games/@/ui/layout-game-cover-art-header'
import { ViewUsersInSpaceList } from '../game/games/@/ui/users-in-space-list'
import { GameCoverArt } from '../game/games/cover-art'

const update: SpaceFrontendModule['update'] = (input) => {
  return SpaceFrontendModule.andThen(
    { model: input.model },
    (model) => updateFromMsgCore({ ...input, model }),
    (model) => updateFromJoinSpaceButton({ ...input, model }),
  )
}

const updateFromJoinSpaceButton: SpaceFrontendModule['update'] = (input) => {
  switch (input.msg?.t) {
    case 'clicked-join-space-button': {
      if (!input.ctx.currentUserId) {
        return {
          model: input.model,
        }
      }

      const spaceEventNew = withEventId<SpaceEvent>({
        t: 'user-joined-space',
        spaceId: input.msg.spaceId,
        userId: input.ctx.currentUserId,
      })

      return {
        model: input.model,
        msgCore: [spaceEventNew],
      }
    }
    default: {
      return {
        model: input.model,
      }
    }
  }
}

const updateFromMsgCore: SpaceFrontendModule['update'] = (input) => {
  switch (input.msgCore?.t) {
    case 'user-joined-space': {
      const error = SpacesCoreFrontend.toErrorByEvenId(input.model, input.msgCore.eventId)

      switch (error?.t) {
        case 'user-already-in-a-space': {
          if (error.userId === input.ctx.currentUserId) {
            return {
              model: input.model,
              msgCmd: showErrSm(input.ctx.t("spaces.you're-already-in-a-space")),
            }
          }

          return {
            model: input.model,
          }
        }
      }

      const currentUserSpaceId = SpacesCoreFrontend.toSpaceIdByUserId(input.model, input.ctx.currentUserId)

      if (input.msgCore.spaceId !== currentUserSpaceId) {
        return {
          model: input.model,
        }
      }

      if (input.msgCore.userId !== input.ctx.currentUserId) {
        const username = input.ctx.profiles[input.msgCore.userId]?.username ?? null
        return {
          model: input.model,
          msgCmd: [
            playSound(APP_SOUND.navForward),
            username
              ? showToast(input.ctx.t('spaces.other-user-joined-space', username))
              : showToast(input.ctx.t('spaces.current-user-joined-space')),
          ],
        }
      }

      return {
        model: input.model,
        msgCmd: [playSound(APP_SOUND.navForward), showToast(input.ctx.t('spaces.current-user-joined-space'))],
      }
    }

    default: {
      return {
        model: input.model,
      }
    }
  }
}

const View: SpaceFrontendModule['View'] = (input) => {
  const currentUser = input.ctx.currentUser

  if (!currentUser) {
    return null
  }

  const space = input.ctx.space

  if (!space) {
    return null
  }

  const spaceState = SpacesCoreFrontend.toSpaceStarted(input.model, space?.spaceId)

  if (!spaceState) {
    return null
  }

  return (
    <div className='flex h-full w-full flex-col overflow-hidden'>
      <LayoutGameCoverArtHeader
        ctx={input.ctx}
        onBack={() =>
          input.dispatch({
            t: 'clicked-go-home-button',
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
              currentUser,
            }}
            onOpenUserDetails={(userId) =>
              input.dispatch({
                t: 'clicked-user',
                userId,
              })
            }
          />
        )}
      />

      <div className='flex flex-row gap-4 p-4'>
        <Button
          className='flex-1'
          variant='contained'
          color='primary'
          onClick={() => input.dispatch({ t: 'clicked-join-space-button', spaceId: space.spaceId })}
          text={input.ctx.t('spaces.join-space')}
        />
      </div>
    </div>
  )
}

export const JoinSpaceFrontend = {
  View,
  update,
}
