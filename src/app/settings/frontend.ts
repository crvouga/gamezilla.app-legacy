import { Eff } from '~/@/eff'
import { Sub } from '~/@/sub'
import { Gutter } from '~/@/ui/gutter'
import { IconCode, IconGear, IconLanguage } from '~/@/ui/icon'
import { ListItemButton } from '~/@/ui/list-item-button'
import { h } from '~/@/vdom/h'
import { VDomImpl } from '~/@/vdom/vdom-impl'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { PushScreenCmd } from '~/app/@/frontend/push-screen-cmd.$msg'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import { AppFrontendModule } from '../@/architecture/app-frontend'
import { APP_SOUND } from '../@/frontend/app-sound'
import { CloseAppBarCmd } from '../@/frontend/close-app-bar-cmd.$msg'
import { ReplaceScreenCmd } from '../@/frontend/replace-screen-cmd.$msg'
import { ScreenLangFrontend } from './screen-lang/frontend'
import { ScreenRendererFrontend } from './screen-renderer/frontend'
import { SoundFrontend } from './sound'
import type { FrontendModule, MsgFrontend } from './types'

const TEST_ID = {
  ...ScreenLangFrontend.TEST_ID,
  ...ScreenRendererFrontend.TEST_ID,
  SETTINGS_SCREEN: 'settings/settings-screen',
  SETTINGS_SCREEN_OPEN_BUTTON: 'settings/settings-screen-open-button',
}

const init: FrontendModule['init'] = (input) => {
  const lang = ScreenLangFrontend.init(input)
  const renderer = ScreenRendererFrontend.init()
  const sound = SoundFrontend.init(input)

  return {
    model: {
      ...lang.model,
      ...renderer.model,
      sound: sound.model,
      isStatusBarOpen: false,
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
        model,
        msgOut: [PushScreenCmd.init({ t: 'main', n: 'settings' }, true), CloseAppBarCmd.init()],
      }
    }

    case 'settings.clicked-open-lang': {
      if (ctx.currentScreen.n === 'settings' && ctx.currentScreen.t === 'choose-lang') {
        return {
          model,
          msgOut: [PlaySoundCmd.init(APP_SOUND.navForwardMin), CloseAppBarCmd.init()],
        }
      }

      return {
        model,
        msgOut: [PushScreenCmd.init({ t: 'choose-lang', n: 'settings' }, true), CloseAppBarCmd.init()],
      }
    }

    case 'settings.clicked-open-settings': {
      return {
        model,
        msgOut: [PushScreenCmd.init({ t: 'main', n: 'settings' }, true), CloseAppBarCmd.init()],
      }
    }

    case 'settings.clicked-back-button': {
      return {
        model,
        msgOut: [ReplaceScreenCmd.init({ t: 'login', n: 'auth' }, true)],
      }
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

const ViewSettingsListItem: FrontendModule['View'] = (input) => {
  return ListItemButton({
    icon: (props) => h(IconGear, props),
    primary: input.ctx.t('l18n.settings'),
    dataTestId: TEST_ID.SETTINGS_SCREEN_OPEN_BUTTON,
    onClick: () => input.dispatch({ t: 'settings.clicked-open-settings' }),
  })
}

const ViewLangListItem: FrontendModule['View'] = ({ model, ctx, dispatch }) => {
  return ListItemButton({
    icon: (inputIcon) => IconLanguage(inputIcon),
    primary: ctx.t('l18n.language'),
    end: () => ctx.t(model.lang),
    onClick: () => {
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
        case 'choose-renderer':
          return ScreenRendererFrontend.View(input)
        default:
          return null
      }
    default:
      return null
  }
}

const ViewMain: FrontendModule['View'] = (input) => {
  return ScreenLayout({
    id: 'setting-main',
    dataTestId: TEST_ID.SETTINGS_SCREEN,
    ctx: input.ctx,
    parentScreen: input.ctx.parentScreen,
    navBar: {
      title: input.ctx.t('l18n.settings'),
      back: { onClick: () => input.dispatch({ t: 'settings.clicked-back-button' }) },
    },
    renderBody: () =>
      h('div', { class: 'flex flex-1 flex-col overflow-y-scroll' }, [
        ListItemButton({
          primary: input.ctx.t('l18n.language'),
          end: () => h('div', {}, [input.ctx.t(input.model.lang)]),
          onClick: () => input.dispatch({ t: 'settings.clicked-open-lang' }),
          link: true,
          icon: (inputIcon) => IconLanguage(inputIcon),
        }),
        ListItemButton({
          primary: input.ctx.t('l18n.renderer'),
          end: () => h('div', {}, [VDomImpl.toName(input.model.renderVDomImpl)]),
          onClick: () => input.dispatch({ t: 'settings.clicked-open-renderer' }),
          icon: (inputIcon) => IconCode(inputIcon),
          link: true,
          dataTestId: TEST_ID.RENDERER_SCREEN_OPEN_BUTTON,
        }),
        Gutter({ variant: 'screen' }),
      ]),
  })
}

export const SettingsFrontend = {
  init,
  update,
  subscriptions,
  TEST_ID,
  ViewLangListItem,
  ViewSettingsListItem,
  View,
}
