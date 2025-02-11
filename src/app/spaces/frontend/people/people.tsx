import { Avatar, Button, IconUserGroup, Typography } from '~/@/ui'
import { APP_SOUND, openProfile, playSound } from '~/app/@/frontend/cmd'
import { ScreenAction } from '~/app/@/ui/screen/action-bar/screen-action-bar-props'
import { SurfaceLayout } from '~/app/@/ui/surface/layout/surface-layout'
import { SpaceFrontendCtx } from '~/app/spaces/@/frontend/ctx'
import { ViewHostChip } from '~/app/spaces/game/games/@/ui/section-people-list/host-chip'
import { SectionPeopleList } from '~/app/spaces/game/games/@/ui/section-people-list/section-people-list'
import { ViewYouChip } from '~/app/spaces/game/games/@/ui/section-people-list/you-chip'
import { SpaceFrontendModule } from '../../architecture/space-frontend'
import { VDom } from '~/@/vdom/vdom'
import { DrawerPosition } from '~/@/ui/surface-drawer/drawer-position'
import { DropDownAlignment } from '~/@/ui/drop-down/drop-down-alignment'
import { DropDownPosition } from '~/@/ui/drop-down/drop-down-position'

const update: SpaceFrontendModule['update'] = (input) => {
  const { model } = input
  return SpaceFrontendModule.andThen(
    { model },
    (model) => updatePeopleModals({ ...input, model }),
    (model) => updateFromCmd({ ...input, model }),
    (model) => updateFromEvent({ ...input, model }),
    (model) => updateUserPreview({ ...input, model }),
  )
}

const updateUserPreview: SpaceFrontendModule['update'] = ({ msg, model }) => {
  switch (msg?.t) {
    case 'clicked-preview-user-link': {
      if (!model.modalPreviewUserId) return { model }

      return { model, msgCmd: [playSound(APP_SOUND.navForwardMin), openProfile(model.modalPreviewUserId)] }
    }
  }
  return { model }
}

const updatePeopleModals: SpaceFrontendModule['update'] = ({ msg, model }) => {
  switch (msg?.t) {
    case 'closed-modal': {
      return { model: { ...model, modal: null }, msgCmd: [playSound(APP_SOUND.surfaceClosed)] }
    }

    case 'clicked-people-button': {
      const isOpen = model.modal === 'users'
      if (isOpen) {
        return { model: { ...model, modal: null }, msgCmd: [playSound(APP_SOUND.surfaceClosed)] }
      }
      return { model: { ...model, modal: 'users' }, msgCmd: [playSound(APP_SOUND.surfaceOpened)] }
    }

    case 'clicked-user': {
      return {
        model: { ...model, modalPreviewUserId: msg.userId, modal: 'user-preview' },
        msgCmd: [playSound(APP_SOUND.tap)],
      }
    }
  }
  return { model }
}

const updateFromCmd: SpaceFrontendModule['update'] = ({ msgCmd, model }) => {
  switch (msgCmd?.t) {
    case 'space-cmd.open-user-details': {
      return {
        model: {
          ...model,
          modalPreviewUserId: msgCmd.userId,
          modal: 'user-preview',
        },
        msgCmd: [playSound(APP_SOUND.tap)],
      }
    }
  }
  return { model }
}

const updateFromEvent: SpaceFrontendModule['update'] = ({ msgEvt, model }) => {
  switch (msgEvt?.t) {
    case 'screen-evt.screen-changed': {
      return { model: { ...model, modal: null } }
    }
  }
  return { model }
}

const DRAWER_POSITION: DrawerPosition = 'top'
const DROPDOWN_POSITION: DropDownPosition = 'bottom'
const DROPDOWN_ALIGNMENT: DropDownAlignment = 'starting'

const ViewSurfaces = (
  input: Parameters<SpaceFrontendModule['View']>[0] & {
    reference: VDom
  },
) => {
  if (!input.ctx.space) return null
  if (!input.ctx.currentUser) return null

  const spaceCtx: SpaceFrontendCtx = {
    ...input.ctx,
    currentUserId: input.ctx.currentUser.userId,
    currentUserRole: input.ctx.currentUser.role,
    space: input.ctx.space,
    currentUser: input.ctx.currentUser,
  }

  const modalProfile = input.model.modalPreviewUserId ? input.ctx.profiles[input.model.modalPreviewUserId] : null
  return (
    <>
      <SurfaceLayout
        ctx={input.ctx}
        drawer={{
          position: DRAWER_POSITION,
        }}
        dropDown={{
          position: DROPDOWN_POSITION,
          alignment: DROPDOWN_ALIGNMENT,
        }}
        ariaLabel={input.ctx.t('spaces.see-profile')}
        id='user-preview'
        dropDownReference={
          <SurfaceLayout
            drawer={{
              position: DRAWER_POSITION,
            }}
            dropDown={{
              position: DROPDOWN_POSITION,
              alignment: DROPDOWN_ALIGNMENT,
            }}
            id='users'
            dropDownReference={input.reference}
            ctx={input.ctx}
            ariaLabel={input.ctx.t('app.people')}
            open={input.model.modal === 'users'}
            onClose={() => input.dispatch({ t: 'closed-modal' })}
            body={{
              render: () => (
                <SectionPeopleList
                  onOpenUserDetails={(userId) => input.dispatch({ t: 'clicked-user', userId })}
                  ctx={spaceCtx}
                />
              ),
            }}
          />
        }
        open={input.model.modal === 'user-preview'}
        onClose={() => input.dispatch({ t: 'closed-modal' })}
        body={{
          render: () => (
            <div>
              <button
                type='button'
                className='flex w-full flex-col items-center justify-center gap-2 p-4'
                onClick={() => input.dispatch({ t: 'clicked-preview-user-link' })}
              >
                <Avatar
                  src={
                    input.model.modalPreviewUserId
                      ? input.ctx.profiles[input.model.modalPreviewUserId]?.avatarUrl
                      : undefined
                  }
                  className='size-24'
                />
                {modalProfile && <Typography variant='title' text={input.ctx.t('username', modalProfile.username)} />}
                <div className='flex items-center gap-2'>
                  {spaceCtx.space.hostId === input.model.modalPreviewUserId && <ViewHostChip ctx={input.ctx} />}
                  {spaceCtx.currentUserId === input.model.modalPreviewUserId && <ViewYouChip ctx={input.ctx} />}
                </div>
              </button>

              <div className='w-full px-4 pb-8'>
                <Button
                  onClick={() => input.dispatch({ t: 'clicked-preview-user-link' })}
                  className='w-full'
                  text={input.ctx.t('spaces.see-profile')}
                />
              </div>
            </div>
          ),
        }}
      />
    </>
  )
}

const viewAction = (input: Parameters<SpaceFrontendModule['View']>[0]): ScreenAction | null => {
  if (!input.ctx.space) return null
  if (!input.ctx.currentUserId) return null

  const peopleCount = Object.keys(input.ctx.space.users).length

  return {
    icon: (inputIcon) => <IconUserGroup {...inputIcon} />,
    label: input.ctx.t('spaces.people-count', peopleCount),
    onClick: () => input.dispatch({ t: 'clicked-people-button' }),
    badge: peopleCount > 1 ? peopleCount : undefined,
    renderSurface: (reference) => <ViewSurfaces {...input} reference={reference} />,
  }
}

export const People = {
  update,
  viewAction,
}
