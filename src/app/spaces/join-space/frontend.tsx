import { withEventId } from '~/@/event-sourced/event'
import { Translator } from '~/@/l18n/generated'
import { Typography } from '~/@/ui'
import { IconArrowRightOnRect } from '~/@/ui/icon/icon-arrow-right-on-rect'
import { APP_SOUND, playSound, pushScreen, showErrSm, showToast } from '~/app/@/frontend/cmd'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import { SectionTitle } from '~/app/@/ui/section/section-title'
import { SurfaceLayout } from '~/app/@/ui/surface/layout/surface-layout'
import { SpaceFrontendCtx } from '../@/frontend/ctx'
import { SectionPeopleList } from '../@/ui/section-people-list'
import { SectionPersonDetails } from '../@/ui/section-person-details'
import { SpaceFrontendModule } from '../architecture/space-frontend'
import { SpacesCore } from '../core/core'
import { MsgSpace } from '../core/space-msg/space-msg'
import { GameName } from '../game/games/@/game-name'
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
    case 'join-space.clicked-person-list-item': {
      const isOpen = input.model.opened === 'join-space.person-preview-surface'
      if (isOpen) {
        return {
          model: { ...input.model, opened: null },
          msgCmd: [playSound(APP_SOUND.tap)],
        }
      }
      return {
        model: { ...input.model, opened: 'join-space.person-preview-surface' },
        msgCmd: [playSound(APP_SOUND.tap)],
      }
    }
    case 'join-space.submitted-join-space-form': {
      if (!input.ctx.currentUser?.userId) return { model: input.model }

      return {
        model: input.model,
        msgSpace: [
          withEventId<MsgSpace>({
            t: 'user-joined-space',
            spaceId: input.msg.spaceId,
            userId: input.ctx.currentUser.userId,
          }),
        ],
      }
    }
    case 'join-space.closed-person-item-surface': {
      if (input.model.opened === 'join-space.person-preview-surface') {
        return { model: { ...input.model, opened: null }, msgCmd: [playSound(APP_SOUND.tap)] }
      }
      return { model: input.model }
    }

    case 'join-space.opened-person-details': {
      return {
        model: input.model,
        msgCmd: [pushScreen({ t: 'profile', n: 'profile', userId: input.msg.userId }, true)],
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
          if (error.userId === input.ctx.currentUser?.userId) {
            return {
              model: input.model,
              msgCmd: showErrSm(input.ctx.t("spaces.you're-already-in-a-space")),
            }
          }

          return { model: input.model }
        }
      }

      const currentUserSpaceId = SpacesCore.toSpaceIdByUserId(input.model.spaces, input.ctx.currentUser?.userId)

      if (input.msgSpace.spaceId !== currentUserSpaceId) return { model: input.model }

      if (input.msgSpace.userId !== input.ctx.currentUser?.userId) {
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

  const spaceCtx: SpaceFrontendCtx = {
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
        onSubmit: () => input.dispatch({ t: 'join-space.submitted-join-space-form', spaceId: space.spaceId }),
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
        onBack: () => input.dispatch({ t: 'exit-space-action.clicked-exit-space-button' }),
      }}
      renderBody={() => (
        <div className='flex w-full flex-col gap-6'>
          {spaceState.game && <SectionGame ctx={input.ctx} gameName={spaceState.game.t} />}

          <SectionPeopleList
            ctx={spaceCtx}
            onClickItem={(userId) => input.dispatch({ t: 'join-space.clicked-person-list-item', userId })}
            renderItem={(profile, vDom) => (
              <SurfaceLayout
                ctx={spaceCtx}
                ariaLabel={input.ctx.t('?')}
                open={input.model.opened === 'join-space.person-preview-surface'}
                onClose={() => input.dispatch({ t: 'join-space.closed-person-item-surface' })}
                drawer={{
                  position: 'bottom',
                }}
                dropDown={{
                  position: 'bottom',
                  alignment: 'starting',
                }}
                id='user-preview'
                dropDownReference={vDom}
                body={{
                  render: () => (
                    <SectionPersonDetails
                      onOpenDetails={() =>
                        input.dispatch({ t: 'join-space.opened-person-details', userId: profile.userId })
                      }
                      ctx={spaceCtx}
                      profile={profile}
                    />
                  ),
                }}
              />
            )}
          />
        </div>
      )}
    />
  )
}

const SectionGame = (props: {
  ctx: {
    t: Translator
  }
  gameName: GameName
}) => {
  return (
    <section className='flex w-full flex-col gap-6 py-3'>
      <SectionTitle text={props.ctx.t('spaces.game')} />

      <div className='flex w-fit flex-row items-center gap-4 px-6'>
        <GameCoverArt className='aspect-square size-20 overflow-hidden rounded border' gameName={props.gameName} />

        <Typography variant='label' sizeClassName='text-lg' text={props.ctx.t(props.gameName)} />
      </div>
    </section>
  )
}

export const JoinSpaceFrontend = {
  View,
  update,
}
