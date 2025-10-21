import { Eff } from '~/@/eff'
import { Sub } from '~/@/sub'
import { DropDownAlignment } from '~/@/ui/drop-down/drop-down-alignment'
import { DropDownConfig } from '~/@/ui/drop-down/drop-down-config'
import { DropDownPosition } from '~/@/ui/drop-down/drop-down-position'
import { IconUserGroup } from '~/@/ui/icon'
import { DrawerPosition } from '~/@/ui/surface-drawer/drawer-position'
import { h } from '~/@/vdom/h'
import { UserId } from '~/app/@/data/user-id'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { playSound } from '~/app/@/frontend/sound-cmd'
import { FloatingLayout } from '~/app/@/ui/floating/layout/floating-layout'
import { ScreenAction } from '~/app/@/ui/screen/action-bar/screen-action-bar-props'
import { CurrentScreenEvt, currentScreenEvts } from '~/app/frontend/current-screen/current-screen-evt'
import { profileCmds } from '~/app/profile/profile-cmd'
import { SpaceFrontendCtx } from '~/app/spaces/@/frontend/ctx'
import { SectionPeopleList } from '../../@/ui/section-people-list'
import { SectionPersonDetails } from '../../@/ui/section-person-details'
import { FrontendCtxModule, ModelFrontend } from '../../types'
import { OpenUserDetailsCmd, openUserDetailsCmds } from './open-user-details-cmd'

export type Msg =
  | { t: 'peopleAction_closedSurface' }
  | { t: 'peopleAction_clickedPeopleAction' }
  | { t: 'peopleAction_clickedPersonMenuItem'; userId: UserId }
  | { t: 'peopleAction_clickedPreviewUserLink' }
  | { t: 'peopleActions_gotCurrentScreenEvt'; c: CurrentScreenEvt }
  | { t: 'peopleActions_gotOpenUserDetailsCmd'; c: OpenUserDetailsCmd }

const update = (input: {
  ctx: FrontendCtxModule
  model: ModelFrontend
  msg: Msg
}): {
  model: ModelFrontend
  eff?: Eff<Msg>
} => {
  switch (input.msg.t) {
    case 'peopleAction_clickedPreviewUserLink': {
      const userId = input.ctx.currentUser?.userId
      if (!userId) return { model: input.model }
      return {
        model: input.model,
        eff: Eff.batch([playSound(APP_SOUND.tap), () => profileCmds.pub({ t: 'openProfile', userId })]),
      }
    }

    case 'peopleAction_closedSurface': {
      return {
        model: { ...input.model, spaces_opened: null },
        eff: playSound(APP_SOUND.surfaceClosed),
      }
    }

    case 'peopleAction_clickedPeopleAction': {
      const isOpen = input.model.spaces_opened === 'people.people-surface'
      if (isOpen) {
        return { model: { ...input.model, spaces_opened: null }, eff: playSound(APP_SOUND.surfaceClosed) }
      }
      return {
        model: { ...input.model, spaces_opened: 'people.people-surface' },
        eff: playSound(APP_SOUND.surfaceOpened),
      }
    }

    case 'peopleAction_clickedPersonMenuItem': {
      return {
        model: {
          ...input.model,
          spaces_openedPreviewUserId: input.msg.userId,
          spaces_opened: 'people.person-preview-surface',
        },
        eff: playSound(APP_SOUND.tap),
      }
    }
    case 'peopleActions_gotCurrentScreenEvt': {
      switch (input.msg.c.t) {
        case 'screenChanged': {
          return { model: { ...input.model, spaces_opened: null } }
        }
      }
    }
    case 'peopleActions_gotOpenUserDetailsCmd': {
      switch (input.msg.c.t) {
        case 'openUserDetails': {
          return {
            model: {
              ...input.model,
              spaces_openedPreviewUserId: input.msg.c.userId,
              spaces_opened: 'people.person-preview-surface',
            },
            eff: playSound(APP_SOUND.tap),
          }
        }
      }
    }
  }
}

export const subscriptions = (_input: { ctx: FrontendCtxModule; model: ModelFrontend }): Sub<Msg> => {
  return Sub.batch<Msg>([
    //
    Sub.map(currentScreenEvts, (c): Msg => ({ t: 'peopleActions_gotCurrentScreenEvt', c })),
    Sub.map(openUserDetailsCmds, (c): Msg => ({ t: 'peopleActions_gotOpenUserDetailsCmd', c })),
  ])
}

const DRAWER_POSITION: DrawerPosition = 'top'
const DROPDOWN_POSITION: DropDownPosition = 'bottom'
const DROPDOWN_ALIGNMENT: DropDownAlignment = 'starting'

const ViewSurfaces = (input: {
  ctx: FrontendCtxModule
  model: ModelFrontend
  dispatch: (msg: Msg) => void
  dropDown: DropDownConfig
}) => {
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

const view = (input: {
  ctx: FrontendCtxModule
  model: ModelFrontend
  dispatch: (msg: Msg) => void
}): ScreenAction | null => {
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
