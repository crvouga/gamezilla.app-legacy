import { Eff } from '~/@/eff'
import { Sub } from '~/@/sub'
import { Gutter } from '~/@/ui/gutter'
import { IconCode, IconLanguage } from '~/@/ui/icon'
import { MenuItem } from '~/@/ui/menu-item'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { ScrollBox } from '~/@/vdom/primitives/scroll-box'
import { Text } from '~/@/vdom/primitives/text'
import { sx } from '~/@/vdom/style/sx'
import { VDomImplWeb } from '~/@/vdom/vdom-impl-web'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { PushScreenCmd } from '~/app/@/frontend/push-screen-cmd.$msg'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import { andThen } from '../@/frontend/and-then'
import { APP_SOUND } from '../@/frontend/app-sound'
import { BackScreenCmd } from '../@/frontend/back-screen-cmd.$msg'
import { ScreenLangFrontend } from './screen-lang/frontend'
import { ScreenRendererFrontend } from './screen-renderer/frontend'
import { SoundFrontend } from './sound'
import {
  isMsgFrontendBase,
  type FrontendCtxModule,
  type FrontendModule,
  type ModelFrontend,
  type MsgFrontend,
} from './types'

const init: FrontendModule['init'] = (input) => {
  const lang = ScreenLangFrontend.init(input)
  const renderer = ScreenRendererFrontend.init(input)
  const sound = SoundFrontend.init(input)

  return {
    model: {
      ...lang.model,
      ...renderer.model,
      ...sound.model,
      settings_opened: null,
    },
  }
}

const update = <T extends ModelFrontend>(input: {
  ctx: FrontendCtxModule
  model: T
  msg?: unknown
  msgIn?: unknown
}): {
  model: T
  eff?: Eff<MsgFrontend>
  msgOut?: unknown[]
} => {
  return andThen<T, MsgFrontend>(
    { model: input.model },
    (model) => updateBase({ ...input, model }),
    (model) => SoundFrontend.update({ ...input, model }),
    (model) => ScreenLangFrontend.update({ ...input, model }),
    (model) => ScreenRendererFrontend.update({ ...input, model }),
  )
}

const updateBase: typeof update = ({ model, ctx, msg }) => {
  if (!isMsgFrontendBase(msg)) return { model }

  switch (msg.t) {
    case 'settings_clickedOpenRenderer': {
      return {
        model: { ...model, settings_opened: null },
        msgOut: [PushScreenCmd.init({ n: 'settings', t: 'settings_renderer' }, true)],
      }
    }

    case 'settings_clickedOpenLang': {
      if (ctx.currentScreen.n === 'settings' && ctx.currentScreen.t === 'settings_chooseLang') {
        return {
          model: { ...model, settings_opened: null },
          msgOut: [PlaySoundCmd.init(APP_SOUND.navForwardMin)],
        }
      }

      return {
        model: { ...model, settings_opened: null },
        msgOut: [PushScreenCmd.init({ n: 'settings', t: 'settings_chooseLang' }, true)],
      }
    }

    case 'settings_clickedOpenSettings': {
      return {
        model: { ...model, settings_opened: null },
        msgOut: [PushScreenCmd.init({ n: 'settings', t: 'settings_main', back: ctx.currentScreen }, true)],
      }
    }

    case 'settings_clickedBackButton': {
      return { model, msgOut: [BackScreenCmd.init()] }
    }

    case 'settings_clickedTopBar': {
      const isOpenNew = model.settings_opened === 'top-bar-surface' ? null : 'top-bar-surface'
      return {
        model: { ...model, settings_opened: isOpenNew },
        msgOut: [PlaySoundCmd.init(APP_SOUND.tap)],
      }
    }

    case 'settings_closedTopBarSurface': {
      return {
        model: {
          ...model,
          settings_opened: null,
        },
        msgOut: [PlaySoundCmd.init(APP_SOUND.tap)],
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

const View: FrontendModule['View'] = (input) => {
  switch (input.ctx.currentScreen.n) {
    case 'settings':
      switch (input.ctx.currentScreen.t) {
        case 'settings_main':
          return h(ViewMain, input)
        case 'settings_chooseLang':
          return h(ScreenLangFrontend.View, input)
        case 'settings_renderer':
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
        onPress: () => props.dispatch({ t: 'settings_clickedBackButton' }),
      },
    },
    renderBody: () =>
      h(ScrollBox, { style: sx({ flexDirection: 'col', flex: 1 }) }, [
        h(MenuItem, {
          primary: props.ctx.t('l18n.language'),
          renderEnd: (endProps) => h(Text, { ...endProps, text: props.ctx.t(props.model.lang_lang ?? 'en') }),
          onPress: () => props.dispatch({ t: 'settings_clickedOpenLang' }),
          link: true,
          renderIcon: (inputIcon) => IconLanguage(inputIcon),
        }),
        h(MenuItem, {
          primary: props.ctx.t('l18n.renderer'),
          renderEnd: (endProps) =>
            h(Box, {}, [h(Text, { ...endProps, text: VDomImplWeb.toName(props.model.render_vDomImpl) })]),
          onPress: () => props.dispatch({ t: 'settings_clickedOpenRenderer' }),
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
