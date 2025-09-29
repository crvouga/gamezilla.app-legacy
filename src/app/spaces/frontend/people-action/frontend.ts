import { DropDownAlignment } from '~/@/ui/drop-down/drop-down-alignment'
import { DropDownConfig } from '~/@/ui/drop-down/drop-down-config'
import { DropDownPosition } from '~/@/ui/drop-down/drop-down-position'
import { IconUserGroup } from '~/@/ui/icon'
import { DrawerPosition } from '~/@/ui/surface-drawer/drawer-position'
import { h } from '~/@/vdom/h'
import { UserId } from '~/app/@/data/user-id'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { OpenProfileCmd } from '~/app/@/frontend/open-profile-cmd.$msg'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { ScreenChangedEvt } from '~/app/@/frontend/screen-changed-evt.$msg'
import { ScreenAction } from '~/app/@/ui/screen/action-bar/screen-action-bar-props'
import { FloatingLayout } from '~/app/@/ui/floating/layout/floating-layout'
import { SpaceFrontendCtx } from '~/app/spaces/@/frontend/ctx'
import { OpenUserDetailsCmd } from '../../@/frontend/open-user-details-cmd'
import { SectionPeopleList } from '../../@/ui/section-people-list'
import { SectionPersonDetails } from '../../@/ui/section-person-details'
import { SpaceFrontendModule } from '../space-frontend'

export type FrontendMsg =
  | { t: 'peopleAction_closedSurface' }
  | { t: 'peopleAction_clickedPeopleAction' }
  | { t: 'peopleAction_clickedPersonMenuItem'; userId: UserId }

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
    case 'peopleAction_clickedPreviewUserLink': {
      if (!model.spaces_openedPreviewUserId) return { model }

      return {
        model,
        msgOut: [PlaySoundCmd.init(APP_SOUND.navForwardMin), OpenProfileCmd.init(model.spaces_openedPreviewUserId)],
      }
    }
  }
  return { model }
}

const updatePeopleModals: SpaceFrontendModule['update'] = ({ msg, model }) => {
  switch (msg?.t) {
    case 'peopleAction_closedSurface': {
      return { model: { ...model, spaces_opened: null }, msgOut: [PlaySoundCmd.init(APP_SOUND.surfaceClosed)] }
    }

    case 'peopleAction_clickedPeopleAction': {
      const isOpen = model.spaces_opened === 'people.people-surface'
      if (isOpen) {
        return { model: { ...model, spaces_opened: null }, msgOut: [PlaySoundCmd.init(APP_SOUND.surfaceClosed)] }
      }
      return {
        model: { ...model, spaces_opened: 'people.people-surface' },
        msgOut: [PlaySoundCmd.init(APP_SOUND.surfaceOpened)],
      }
    }

    case 'peopleAction_clickedPersonMenuItem': {
      return {
        model: { ...model, spaces_openedPreviewUserId: msg.userId, spaces_opened: 'people.person-preview-surface' },
        msgOut: [PlaySoundCmd.init(APP_SOUND.tap)],
      }
    }
  }
  return { model }
}

const updateFromCmd: SpaceFrontendModule['update'] = ({ msgIn, model }) => {
  if (OpenUserDetailsCmd.is(msgIn)) {
    return {
      model: {
        ...model,
        spaces_openedPreviewUserId: msgIn.userId,
        spaces_opened: 'people.person-preview-surface',
      },
      msgOut: [PlaySoundCmd.init(APP_SOUND.tap)],
    }
  }

  return { model }
}

const updateFromEvent: SpaceFrontendModule['update'] = ({ msgIn, model }) => {
  if (ScreenChangedEvt.is(msgIn)) {
    return { model: { ...model, spaces_opened: null } }
  }

  return { model }
}

const DRAWER_POSITION: DrawerPosition = 'top'
const DROPDOWN_POSITION: DropDownPosition = 'bottom'
const DROPDOWN_ALIGNMENT: DropDownAlignment = 'starting'

const ViewSurfaces = (
  input: Parameters<SpaceFrontendModule['View']>[0] & {
    dropDown: DropDownConfig
  },
) => {
  if (!input.ctx.space) return null
  if (!input.ctx.currentUser) return null

  const spaceCtx: SpaceFrontendCtx = { ...input.ctx, space: input.ctx.space, currentUser: input.ctx.currentUser }

  const modalProfile = input.model.spaces_openedPreviewUserId
    ? input.ctx.profilesByUserId[input.model.spaces_openedPreviewUserId]
    : null
  return h(FloatingLayout, {
    ctx: input.ctx,
    drawer: {
      position: DRAWER_POSITION,
    },
    dropDown: {
      position: DROPDOWN_POSITION,
      alignment: DROPDOWN_ALIGNMENT,
      reference: {
        render: () =>
          h(FloatingLayout, {
            drawer: {
              position: DRAWER_POSITION,
            },
            dropDown: {
              ...input.dropDown,
              position: DROPDOWN_POSITION,
              alignment: DROPDOWN_ALIGNMENT,
            },
            id: 'users',
            ctx: input.ctx,
            ariaLabel: input.ctx.t('app.people'),
            open: input.model.spaces_opened === 'people.people-surface',
            onClose: () => input.dispatch({ t: 'peopleAction_closedSurface' }),
            body: {
              render: () =>
                h(SectionPeopleList, {
                  ctx: spaceCtx,
                  onPressItem: (userId) => input.dispatch({ t: 'peopleAction_clickedPersonMenuItem', userId }),
                }),
            },
          }),
      },
    },
    ariaLabel: input.ctx.t('app.see-profile'),
    id: 'user-preview',
    open: input.model.spaces_opened === 'people.person-preview-surface',
    onClose: () => input.dispatch({ t: 'peopleAction_closedSurface' }),
    body: {
      render: () =>
        h(SectionPersonDetails, {
          ctx: spaceCtx,
          profile: modalProfile ?? null,
          onOpenDetails: () => input.dispatch({ t: 'peopleAction_clickedPreviewUserLink' }),
        }),
    },
  })
}

const view = (input: Parameters<SpaceFrontendModule['View']>[0]): ScreenAction | null => {
  if (!input.ctx.space) return null
  if (!input.ctx.currentUser?.userId) return null

  const peopleCount = Object.keys(input.ctx.space.users).length

  return {
    id: input.ctx.t('app.people'),
    renderIcon: (iconProps) => h(IconUserGroup, iconProps),
    label: input.ctx.t('spaces.people-count', peopleCount),
    onPress: () => input.dispatch({ t: 'peopleAction_clickedPeopleAction' }),
    badge: peopleCount > 1 ? peopleCount : undefined,
    renderSurface: ({ dropDown }) => h(ViewSurfaces, { ...input, dropDown }),
  }
}

export const PeopleActionFrontend = {
  update,
  view,
}
