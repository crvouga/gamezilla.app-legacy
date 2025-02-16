import { withEventId } from '~/@/event-sourced/event'
import { Typography } from '~/@/ui'
import { IconArrowRightOnRect } from '~/@/ui/icon/icon-arrow-right-on-rect'
import { APP_SOUND, playSound, showErrSm, showToast } from '~/app/@/frontend/cmd'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import { SectionTitle } from '~/app/@/ui/section/section-title'
import { SpaceFrontendModule } from '../architecture/space-frontend'
import { SpacesCore } from '../core/core'
import { MsgSpace } from '../core/space-msg/space-msg'

import { SectionPeopleList } from '../@/ui/section-people-list'
import { GameCoverArt } from '../game/games/cover-art'

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
      const error = SpacesCore.toErrorByEvenId(input.model.spaces, input.msgSpace.eventId)

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

      const currentUserSpaceId = SpacesCore.toSpaceIdByUserId(input.model.spaces, input.ctx.currentUserId)

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

  const spaceState = SpacesCore.toSpaceStarted(input.model.spaces, space?.spaceId)

  if (!spaceState) return null

  const spaceCtx = {
    ...input.ctx,
    space: space,
    currentUserId: currentUser.userId,
    currentUserRole: currentUser.role,
    currentUser,
  }
  const hostProfile = input.ctx.profiles[spaceState.hostId]

  return (
    <ScreenLayout
      id='join-space'
      parentScreen={input.ctx.parentScreen}
      ctx={input.ctx}
      postAction={{
        onSubmit: () => input.dispatch({ t: 'submitted-join-space-form', spaceId: space.spaceId }),
        submitText: input.ctx.t('spaces.join-space'),
        submitLoading: false,
        submitDisabled: false,
        submitIcon: (props) => <IconArrowRightOnRect {...props} />,
      }}
      navBar={{
        title: hostProfile
          ? input.ctx.t('spaces.current-space', {
              hostUsername: hostProfile.username,
            })
          : null,
        onBack: () => input.dispatch({ t: 'clicked-exit-space-button' }),
      }}
      renderBody={() => (
        <div className='flex w-full flex-col gap-6'>
          {spaceState.game && (
            <section className='flex w-full flex-col gap-6 py-3'>
              <SectionTitle text={input.ctx.t('spaces.game')} />
              <div className='flex w-fit flex-row items-center gap-4 px-6'>
                <div className='aspect-square size-20 overflow-hidden rounded border'>
                  <GameCoverArt gameName={spaceState.game?.t ?? null} />
                </div>
                <Typography variant='label' sizeClassName='text-lg' text={input.ctx.t(spaceState.game.t)} />
              </div>
            </section>
          )}

          <SectionPeopleList
            ctx={spaceCtx}
            onOpenUserDetails={(userId) => input.dispatch({ t: 'people-action.clicked-person-list-item', userId })}
          />
        </div>
      )}
    />
  )
}

export const JoinSpaceFrontend = {
  View,
  update,
}
