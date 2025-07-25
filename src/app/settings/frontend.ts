import { Eff } from '~/@/eff'
import { TranslatedText } from '~/@/l18n'
import { Sub } from '~/@/sub'
import { Clickable } from '~/@/ui/clickable'
import { cn } from '~/@/ui/cn'
import { Gutter } from '~/@/ui/gutter'
import { IconCode, IconGear, IconLanguage, IconPowerOff } from '~/@/ui/icon'
import { ListItem } from '~/@/ui/list-item'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { Text } from '~/@/vdom/primitives/text'
import { VDomImplWeb } from '~/@/vdom/vdom-impl-web'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { PushScreenCmd } from '~/app/@/frontend/push-screen-cmd.$msg'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import { AppFrontendModule } from '../@/architecture/app-frontend'
import { APP_SOUND } from '../@/frontend/app-sound'
import { BackScreenCmd } from '../@/frontend/back-screen-cmd.$msg'
import { LogoutCmd } from '../@/frontend/logout-cmd.$msg'
import { SurfaceLayout } from '../@/ui/surface/layout/surface-layout'
import { BackendConnectionStatus } from '../@/wire/backend-connection-status'
import { ScreenLangFrontend } from './screen-lang/frontend'
import { ScreenRendererFrontend } from './screen-renderer/frontend'
import { SoundFrontend } from './sound'
import type { FrontendModule, MsgFrontend } from './types'

const init: FrontendModule['init'] = (input) => {
  const lang = ScreenLangFrontend.init(input)
  const renderer = ScreenRendererFrontend.init()
  const sound = SoundFrontend.init(input)

  return {
    model: {
      ...lang.model,
      ...renderer.model,
      sound: sound.model,
      isTopBarSurfaceOpen: false,
    },
  }
}

const update: FrontendModule['update'] = (input) => {
  return AppFrontendModule.andThen(
    { model: input.model },
    (model) => updateBase({ ...input, model }),
    (model) => updateChild({ ...input, model }),
    (model) => ScreenLangFrontend.update({ ...input, model }),
    (model) => ScreenRendererFrontend.update({ ...input, model }),
  )
}

const updateChild: FrontendModule['update'] = (input) => {
  const sound = SoundFrontend.update({
    ...input,
    model: input.model.sound,
    msg: input.msg?.t === 'sound' ? input.msg.c : null,
  })
  return {
    model: { ...input.model, sound: sound.model },
    msgOut: sound.msgOut,
    eff: Eff.tag('sound', sound.eff),
  }
}

const updateBase: FrontendModule['update'] = ({ model, ctx, msg }) => {
  if (!msg) return { model }

  switch (msg?.t) {
    case 'settings.clicked-open-renderer': {
      return {
        model: { ...model, isTopBarSurfaceOpen: false },
        msgOut: [PushScreenCmd.init({ t: 'renderer', n: 'settings' }, true)],
      }
    }

    case 'settings.clicked-open-lang': {
      if (ctx.currentScreen.n === 'settings' && ctx.currentScreen.t === 'choose-lang') {
        return {
          model: { ...model, isTopBarSurfaceOpen: false },
          msgOut: [PlaySoundCmd.init(APP_SOUND.navForwardMin)],
        }
      }

      return {
        model: { ...model, isTopBarSurfaceOpen: false },
        msgOut: [PushScreenCmd.init({ t: 'choose-lang', n: 'settings' }, true)],
      }
    }

    case 'settings.clicked-open-settings': {
      return {
        model: { ...model, isTopBarSurfaceOpen: false },
        msgOut: [PushScreenCmd.init({ t: 'main', n: 'settings', back: ctx.currentScreen }, true)],
      }
    }

    case 'settings.clicked-back-button': {
      return { model, msgOut: [BackScreenCmd.init()] }
    }

    case 'settings.clicked-logout-list-item': {
      return {
        model: { ...model, isTopBarSurfaceOpen: false },
        msgOut: [LogoutCmd.init()],
      }
    }

    case 'settings.clicked-top-bar': {
      const isOpenNew = !model.isTopBarSurfaceOpen
      return { model: { ...model, isTopBarSurfaceOpen: isOpenNew }, msgOut: [PlaySoundCmd.init(APP_SOUND.tap)] }
    }

    case 'settings.closed-top-bar-surface': {
      return { model: { ...model, isTopBarSurfaceOpen: false } }
    }

    default: {
      return {
        model,
      }
    }
  }
}

const subscriptions: FrontendModule['subscriptions'] = (input) => {
  return Sub.batch<MsgFrontend>([ScreenLangFrontend.subscriptions(input)])
}

const ViewLangListItem: FrontendModule['View'] = ({ model, ctx, dispatch }) => {
  return h(ListItem, {
    icon: (inputIcon) => h(IconLanguage, inputIcon),
    primary: ctx.t('l18n.language'),
    end: () => Text({ text: ctx.t(model.lang) }),
    onPress: () => {
      dispatch({ t: 'settings.clicked-open-lang' })
    },
  })
}

const View: FrontendModule['View'] = (input) => {
  switch (input.ctx.currentScreen.n) {
    case 'settings':
      switch (input.ctx.currentScreen.t) {
        case 'main':
          return ViewMain(input)
        case 'choose-lang':
          return ScreenLangFrontend.View(input)
        case 'renderer':
          return ScreenRendererFrontend.View(input)
        default:
          return null
      }
    default:
      return null
  }
}

export const TEST_ID_SETTINGS_SCREEN = 'settings-screen'
export const TEST_ID_TOP_BAR_SURFACE_OPEN_BUTTON = 'top-bar/surface-open-button'
export const TEST_ID_TOP_BAR_SURFACE = 'top-bar/surface'

const ViewMain: FrontendModule['View'] = (props) => {
  return h(ScreenLayout, {
    id: 'setting-main',
    dataTestId: TEST_ID_SETTINGS_SCREEN,
    ctx: props.ctx,
    parentScreen: props.ctx.parentScreen,
    navBar: {
      title: props.ctx.t('l18n.settings'),
      back: { onPress: () => props.dispatch({ t: 'settings.clicked-back-button' }) },
    },
    renderBody: () =>
      h(Box, { class: 'flex flex-1 flex-col overflow-y-scroll' }, [
        h(ListItem, {
          primary: props.ctx.t('l18n.language'),
          end: () => h(Box, {}, [Text({ text: props.ctx.t(props.model.lang) })]),
          onPress: () => props.dispatch({ t: 'settings.clicked-open-lang' }),
          link: true,
          icon: (inputIcon) => IconLanguage(inputIcon),
        }),
        h(ListItem, {
          primary: props.ctx.t('l18n.renderer'),
          end: () => h(Box, {}, [Text({ text: VDomImplWeb.toName(props.model.renderVDomImpl) })]),
          onPress: () => props.dispatch({ t: 'settings.clicked-open-renderer' }),
          icon: (inputIcon) => IconCode(inputIcon),
          link: true,
        }),
        h(ViewLogoutListItem, props),
        h(Gutter, { variant: 'screen' }),
      ]),
  })
}

const ViewLogoutListItem: FrontendModule['View'] = (input) => {
  const { currentUserState } = input.ctx
  switch (currentUserState.t) {
    case 'loading':
    case 'logged-out': {
      return null
    }
    case 'logged-in': {
      return h(ListItem, {
        onPress: () => input.dispatch({ t: 'settings.clicked-logout-list-item' }),
        icon: (input) => h(IconPowerOff, input),
        primary: input.ctx.t('auth.logout'),
        end: () =>
          h(Typography, {
            variant: 'caption',
            text: TranslatedText.of(currentUserState.userProfile.username),
          }),
      })
    }
  }
}

const ViewTopBar: FrontendModule['View'] = (props) => {
  const iconSize = props.ctx.screenSize === 'mobile' ? 'size-3' : 'size-4'

  return h(Box, { class: cn(props.ctx.screenSize === 'mobile' ? 'w-full' : 'fixed top-0 right-0 z-10 w-fit') }, [
    h(SurfaceLayout, {
      ctx: props.ctx,
      ariaLabel: props.ctx.t('status-bar.status-bar'),
      drawer: {
        position: 'top',
      },
      id: 'status-bar-drawer',
      open: props.model.isTopBarSurfaceOpen,
      onClose: () => props.dispatch({ t: 'settings.closed-top-bar-surface' }),
      dropDown: {
        reference: {
          render: () =>
            h(
              Clickable,
              {
                'data-testid': TEST_ID_TOP_BAR_SURFACE_OPEN_BUTTON,
                class: cn(
                  props.ctx.screenSize === 'mobile'
                    ? 'flex flex-row w-full items-center justify-end gap-3 px-3 py-1'
                    : 'flex flex-row w-fit justify-center gap-4 px-6 py-3 pl-8',
                ),
                'aria-label': props.ctx.t('app.open-settings'),
                onPress: () => props.dispatch({ t: 'settings.clicked-top-bar' }),
              },
              [
                h(BackendConnectionStatus.ViewDot, {
                  model: props.ctx.backendConnectionStatus,
                  class: iconSize,
                  ctx: props.ctx,
                }),
                h(SoundFrontend.ViewIcon, { model: props.model.sound, class: iconSize }),
                h(IconGear, { class: iconSize }),
              ],
            ),
        },
      },
      body: {
        render: () => {
          return h(Box, { 'data-testid': TEST_ID_TOP_BAR_SURFACE }, [
            h(BackendConnectionStatus.ViewListItem, {
              ctx: props.ctx,
              model: props.ctx.backendConnectionStatus,
              onPress: () => {},
            }),

            h(SoundFrontend.ViewSoundListItem, {
              ctx: props.ctx,
              model: props.model.sound,
              dispatch: (c) => props.dispatch({ t: 'sound', c }),
            }),

            h(ViewLangListItem, props),

            h(ListItem, {
              icon: (inputIcon) => h(IconGear, inputIcon),
              primary: props.ctx.t('l18n.settings'),
              link: true,
              onPress: () => props.dispatch({ t: 'settings.clicked-open-settings' }),
            }),
          ])
        },
      },
    }),
  ])
}

export const SettingsFrontend = {
  ViewLogoutListItem,
  init,
  update,
  subscriptions,

  View,
  ViewTopBar,
}
