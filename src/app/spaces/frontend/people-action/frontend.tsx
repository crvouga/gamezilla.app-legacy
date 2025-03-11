import { IconUserGroup } from '~/@/ui'
import { DropDownAlignment } from '~/@/ui/drop-down/drop-down-alignment'
import { DropDownPosition } from '~/@/ui/drop-down/drop-down-position'
import { DrawerPosition } from '~/@/ui/surface-drawer/drawer-position'
import { VDom } from '~/@/vdom/vdom'
import { UserId } from '~/app/@/data/user-id'
import { APP_SOUND, openProfile, playSound } from '~/app/@/frontend/cmd'
import { ScreenAction } from '~/app/@/ui/screen/action-bar/screen-action-bar-props'
import { SurfaceLayout } from '~/app/@/ui/surface/layout/surface-layout'
import { SpaceFrontendCtx } from '~/app/spaces/@/frontend/ctx'
import { SectionPeopleList } from '../../@/ui/section-people-list'
import { SectionPersonDetails } from '../../@/ui/section-person-details'
import { SpaceFrontendModule } from '../../architecture/space-frontend'

export type FrontendMsg =
  | { t: 'people-action.closed-surface' }
  | { t: 'people-action.clicked-people-action' }
  | { t: 'people-action.clicked-person-list-item'; userId: UserId }

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
    case 'people-action.clicked-preview-user-link': {
      if (!model.openedPreviewUserId) return { model }

      return { model, msgCmd: [playSound(APP_SOUND.navForwardMin), openProfile(model.openedPreviewUserId)] }
    }
  }
  return { model }
}

const updatePeopleModals: SpaceFrontendModule['update'] = ({ msg, model }) => {
  switch (msg?.t) {
    case 'people-action.closed-surface': {
      return { model: { ...model, opened: null }, msgCmd: [playSound(APP_SOUND.surfaceClosed)] }
    }

    case 'people-action.clicked-people-action': {
      const isOpen = model.opened === 'people.people-surface'
      if (isOpen) {
        return { model: { ...model, opened: null }, msgCmd: [playSound(APP_SOUND.surfaceClosed)] }
      }
      return { model: { ...model, opened: 'people.people-surface' }, msgCmd: [playSound(APP_SOUND.surfaceOpened)] }
    }

    case 'people-action.clicked-person-list-item': {
      return {
        model: { ...model, openedPreviewUserId: msg.userId, opened: 'people.person-preview-surface' },
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
          openedPreviewUserId: msgCmd.userId,
          opened: 'people.person-preview-surface',
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
      return { model: { ...model, opened: null } }
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

  const modalProfile = input.model.openedPreviewUserId ? input.ctx.profiles[input.model.openedPreviewUserId] : null
  return (
    <SurfaceLayout
      ctx={input.ctx}
      drawer={{
        position: DRAWER_POSITION,
      }}
      dropDown={{
        position: DROPDOWN_POSITION,
        alignment: DROPDOWN_ALIGNMENT,
        reference: (
          <SurfaceLayout
            drawer={{
              position: DRAWER_POSITION,
            }}
            dropDown={{
              position: DROPDOWN_POSITION,
              alignment: DROPDOWN_ALIGNMENT,
              reference: input.reference,
            }}
            id='users'
            ctx={input.ctx}
            ariaLabel={input.ctx.t('app.people')}
            open={input.model.opened === 'people.people-surface'}
            onClose={() => input.dispatch({ t: 'people-action.closed-surface' })}
            body={{
              render: () => (
                <SectionPeopleList
                  ctx={spaceCtx}
                  onClickItem={(userId) => input.dispatch({ t: 'people-action.clicked-person-list-item', userId })}
                />
              ),
            }}
          />
        ),
      }}
      ariaLabel={input.ctx.t('spaces.see-profile')}
      id='user-preview'
      open={input.model.opened === 'people.person-preview-surface'}
      onClose={() => input.dispatch({ t: 'people-action.closed-surface' })}
      body={{
        render: () => (
          <SectionPersonDetails
            ctx={spaceCtx}
            profile={modalProfile ?? null}
            onOpenDetails={() => input.dispatch({ t: 'people-action.clicked-preview-user-link' })}
          />
        ),
      }}
    />
  )
}

const view = (input: Parameters<SpaceFrontendModule['View']>[0]): ScreenAction | null => {
  if (!input.ctx.space) return null
  if (!input.ctx.currentUser?.userId) return null

  const peopleCount = Object.keys(input.ctx.space.users).length

  return {
    id: input.ctx.t('app.people'),
    icon: (inputIcon) => <IconUserGroup {...inputIcon} />,
    label: input.ctx.t('spaces.people-count', peopleCount),
    onClick: () => input.dispatch({ t: 'people-action.clicked-people-action' }),
    badge: peopleCount > 1 ? peopleCount : undefined,
    renderSurface: ({ reference }) => <ViewSurfaces {...input} reference={reference} />,
  }
}

export const PeopleActionFrontend = {
  update,
  view,
}
