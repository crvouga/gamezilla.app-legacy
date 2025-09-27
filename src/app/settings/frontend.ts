import { Eff } from '~/@/eff'
import { Sub } from '~/@/sub'
import { Gutter } from '~/@/ui/gutter'
import { IconCode, IconLanguage } from '~/@/ui/icon'
import { MenuItem } from '~/@/ui/menu-item'
import { sx } from '~/@/vdom/style/sx'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { ScrollBox } from '~/@/vdom/primitives/scroll-box'
import { Text } from '~/@/vdom/primitives/text'
import { VDomImplWeb } from '~/@/vdom/vdom-impl-web'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { PushScreenCmd } from '~/app/@/frontend/push-screen-cmd.$msg'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import { AppFrontendModule } from '../@/frontend/app-frontend-module'
import { APP_SOUND } from '../@/frontend/app-sound'
import { BackScreenCmd } from '../@/frontend/back-screen-cmd.$msg'
import { ScreenLangFrontend } from './screen-lang/frontend'
import { ScreenRendererFrontend } from './screen-renderer/frontend'
import { SoundFrontend } from './sound'
import type { FrontendModule, MsgFrontend } from './types'

const init: FrontendModule['init'] = (input) => {
  const lang = ScreenLangFrontend.init(input)
  const renderer = ScreenRendererFrontend.init(input)
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

    case 'settings.clicked-top-bar': {
      const isOpenNew = !model.isTopBarSurfaceOpen
      return { model: { ...model, isTopBarSurfaceOpen: isOpenNew }, msgOut: [PlaySoundCmd.init(APP_SOUND.tap)] }
    }

    case 'settings.closed-top-bar-surface': {
      return { model: { ...model, isTopBarSurfaceOpen: false }, msgOut: [PlaySoundCmd.init(APP_SOUND.tap)] }
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

const View: FrontendModule['View'] = (input) => {
  switch (input.ctx.currentScreen.n) {
    case 'settings':
      switch (input.ctx.currentScreen.t) {
        case 'main':
          return h(ViewMain, input)
        case 'choose-lang':
          return h(ScreenLangFrontend.View, input)
        case 'renderer':
          return h(ScreenRendererFrontend.View, input)
        default:
          return null
      }
    default:
      return null
  }
}

export const TEST_ID_SETTINGS_SCREEN = 'settings-screen'

const ViewMain: FrontendModule['View'] = (props) => {
  return h(ScreenLayout, {
    id: 'setting-main',
    dataTestId: TEST_ID_SETTINGS_SCREEN,
    ctx: props.ctx,
    parentScreen: props.ctx.parentScreen,
    navBar: {
      title: props.ctx.t('l18n.settings'),
      back: {
        onPress: () => props.dispatch({ t: 'settings.clicked-back-button' }),
      },
    },
    renderBody: () =>
      h(ScrollBox, { style: sx({ flexDirection: 'col', flex: 1 }) }, [
        h(MenuItem, {
          primary: props.ctx.t('l18n.language'),
          renderEnd: (endProps) => h(Text, { ...endProps, text: props.ctx.t(props.model.lang) }),
          onPress: () => props.dispatch({ t: 'settings.clicked-open-lang' }),
          link: true,
          renderIcon: (inputIcon) => IconLanguage(inputIcon),
        }),
        h(MenuItem, {
          primary: props.ctx.t('l18n.renderer'),
          renderEnd: (endProps) =>
            h(Box, {}, [h(Text, { ...endProps, text: VDomImplWeb.toName(props.model.renderVDomImpl) })]),
          onPress: () => props.dispatch({ t: 'settings.clicked-open-renderer' }),
          renderIcon: (inputIcon) => IconCode(inputIcon),
          link: true,
        }),
        props.slots?.menuItemsEnd?.({}),
        h(Gutter, { variant: 'screen' }),
      ]),
  })
}

export const SettingsFrontend = {
  init,
  update,
  subscriptions,
  View,
}
