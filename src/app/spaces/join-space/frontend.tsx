import { withEventId } from '~/@/event-sourced/event'
import { APP_SOUND, playSound, showErrSm, showToast } from '~/app/@/frontend/cmd'
import { ScreenLayout } from '~/app/@/ui/screen/layout'
import { SpaceFrontendModule } from '../@/architecture/space-frontend'
import { SpacesCore } from '../core/core'
import { MsgSpace } from '../core/space-msg'
import { ViewUsersInSpaceList } from '../game/games/@/ui/users-in-space-list'
import { GameCoverArt } from '../game/games/cover-art'
import { LayoutGameCoverArtHeader } from '../game/games/@/ui/layout-game-cover-art-header'

const update: SpaceFrontendModule['update'] = (input) => {
  return SpaceFrontendModule.andThen(
    { model: input.model },
    (model) => updateFromMsgSpace({ ...input, model }),
    (model) => updateFromJoinSpaceButton({ ...input, model }),
  )
}

const updateFromJoinSpaceButton: SpaceFrontendModule['update'] = (input) => {
  switch (input.msg?.t) {
    case 'submitted-join-space-form': {
      if (!input.ctx.currentUserId) return { model: input.model }

      return {
        model: input.model,
        msgSpace: [
          withEventId<MsgSpace>({
            t: 'user-joined-space',
            spaceId: input.msg.spaceId,
            userId: input.ctx.currentUserId,
          }),
        ],
      }
    }
  }
  return { model: input.model }
}

const updateFromMsgSpace: SpaceFrontendModule['update'] = (input) => {
  switch (input.msgSpace?.t) {
    case 'user-joined-space': {
      const error = SpacesCore.toErrorByEvenId(input.model, input.msgSpace.eventId)

      switch (error?.t) {
        case 'user-already-in-a-space': {
          if (error.userId === input.ctx.currentUserId) {
            return {
              model: input.model,
              msgCmd: showErrSm(input.ctx.t("spaces.you're-already-in-a-space")),
            }
          }

          return { model: input.model }
        }
      }

      const currentUserSpaceId = SpacesCore.toSpaceIdByUserId(input.model, input.ctx.currentUserId)

      if (input.msgSpace.spaceId !== currentUserSpaceId) return { model: input.model }

      if (input.msgSpace.userId !== input.ctx.currentUserId) {
        const username = input.ctx.profiles[input.msgSpace.userId]?.username ?? null
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
  }
  return { model: input.model }
}

const View: SpaceFrontendModule['View'] = (input) => {
  const currentUser = input.ctx.currentUser
  if (!currentUser) return null
  const space = input.ctx.space
  if (!space) return null
  const spaceState = SpacesCore.toSpaceStarted(input.model, space?.spaceId)
  if (!spaceState) return null

  const spaceCtx = {
    ...input.ctx,
    space: space,
    currentUserId: currentUser.userId,
    currentUserRole: currentUser.role,
    currentUser,
  }

  return (
    <ScreenLayout
      id='join-space'
      ctx={input.ctx}
      editAction={{
        onSubmit: () => input.dispatch({ t: 'submitted-join-space-form', spaceId: space.spaceId }),
        submitText: input.ctx.t('spaces.join-space'),
        cancelText: input.ctx.t('app.cancel'),
        onCancel: () => input.dispatch({ t: 'clicked-go-home-button' }),
        submitLoading: false,
        cancelDisabled: false,
        submitDisabled: false,
      }}
      renderBody={() => (
        <LayoutGameCoverArtHeader
          ctx={input.ctx}
          topBar={{
            title: spaceState.game ? input.ctx.t(spaceState.game.t) : input.ctx.t('spaces.space'),
            onBack: () => input.dispatch({ t: 'clicked-go-home-button' }),
          }}
          renderCoverArt={(inputCoverArt) =>
            spaceState.game && (
              <div {...inputCoverArt}>
                <GameCoverArt gameName={spaceState.game.t} />
              </div>
            )
          }
          renderContent={() => (
            <ViewUsersInSpaceList
              ctx={spaceCtx}
              onOpenUserDetails={(userId) => input.dispatch({ t: 'clicked-user', userId })}
            />
          )}
        />
      )}
    />
  )
}

export const JoinSpaceFrontend = {
  View,
  update,
}
