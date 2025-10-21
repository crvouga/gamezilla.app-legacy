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
import { VDom } from '~/@/vdom/vdom'
import { VDomImplWeb } from '~/@/vdom/vdom-impl-web'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import { APP_SOUND } from '../@/frontend/app-sound'
import { playSound } from '../@/frontend/sound-cmd'
import { back, pushScreen } from '../frontend/current-screen/current-screen-cmd'
import { ScreenLangFrontend } from './screen-lang/frontend'
import { ScreenRendererFrontend } from './screen-renderer/frontend'
import { SoundFrontend } from './sound'
import { type FrontendCtxModule, type ModelFrontend, type MsgFrontend } from './types'

const init = (input: { ctx: FrontendCtxModule }): { model: ModelFrontend; eff?: Eff<MsgFrontend> } => {
  const lang = ScreenLangFrontend.init(input)
  const renderer = ScreenRendererFrontend.init(input)
  const sound = SoundFrontend.init(input)

  return {
    model: {
      lang: lang.model,
      renderer: renderer.model,
      sound: sound.model,
      settings_opened: null,
    },
    eff: Eff.batch<MsgFrontend>([
      Eff.tag('lang', lang.eff),
      Eff.tag('renderer', renderer.eff),
      Eff.tag('sound', sound.eff),
    ]),
  }
}

const update = (input: {
  ctx: FrontendCtxModule
  model: ModelFrontend
  msg: MsgFrontend
}): {
  model: ModelFrontend
  eff?: Eff<MsgFrontend>
} => {
  switch (input.msg.t) {
    case 'lang': {
      const updated = ScreenLangFrontend.update({ ...input, model: input.model.lang, msg: input.msg.c })
      return {
        model: { ...input.model, lang: updated.model },
        eff: Eff.tag('lang', updated.eff),
      }
    }
    case 'renderer': {
      const updated = ScreenRendererFrontend.update({ ...input, model: input.model.renderer, msg: input.msg.c })
      return {
        model: { ...input.model, renderer: updated.model },
        eff: Eff.tag('renderer', updated.eff),
      }
    }
    case 'sound': {
      const updated = SoundFrontend.update({ ...input, model: input.model.sound, msg: input.msg.c })
      return {
        model: { ...input.model, sound: updated.model },
        eff: Eff.tag('sound', updated.eff),
      }
    }

    case 'settings_clickedOpenRenderer': {
      return {
        model: { ...input.model, settings_opened: null },
        eff: pushScreen({ n: 'settings', t: 'settings_renderer' }, true),
      }
    }

    case 'settings_clickedOpenLang': {
      if (input.ctx.currentScreen.n === 'settings' && input.ctx.currentScreen.t === 'settings_chooseLang') {
        return {
          model: { ...input.model, settings_opened: null },
          eff: playSound(APP_SOUND.navForwardMin),
        }
      }

      return {
        model: { ...input.model, settings_opened: null },
        eff: pushScreen({ n: 'settings', t: 'settings_chooseLang' }, true),
      }
    }

    case 'settings_clickedOpenSettings': {
      return {
        model: { ...input.model, settings_opened: null },
        eff: pushScreen({ n: 'settings', t: 'settings_main', back: input.ctx.currentScreen }, true),
      }
    }

    case 'settings_clickedBackButton': {
      return { model: input.model, eff: back() }
    }

    case 'settings_clickedTopBar': {
      const isOpenNew = input.model.settings_opened === 'top-bar-surface' ? null : 'top-bar-surface'
      return {
        model: { ...input.model, settings_opened: isOpenNew },
        eff: playSound(APP_SOUND.tap),
      }
    }

    case 'settings_closedTopBarSurface': {
      return {
        model: {
          ...input.model,
          settings_opened: null,
        },
        eff: playSound(APP_SOUND.tap),
      }
    }

    default: {
      return {
        model: input.model,
      }
    }
  }
}

const subscriptions = (input: { ctx: FrontendCtxModule; model: ModelFrontend }): Sub<MsgFrontend> => {
  return Sub.batch<MsgFrontend>([ScreenLangFrontend.subscriptions(input)])
}

const View = (input: {
  ctx: FrontendCtxModule
  model: ModelFrontend
  dispatch: (msg: MsgFrontend) => void
  slots?: {
    menuItemsEnd: (input: {}) => VDom
  }
}) => {
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

const ViewMain: typeof View = (props) => {
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
          renderEnd: (endProps) => h(Text, { ...endProps, text: props.ctx.t(props.model.lang.lang_lang ?? 'en') }),
          onPress: () => props.dispatch({ t: 'settings_clickedOpenLang' }),
          link: true,
          renderIcon: (inputIcon) => IconLanguage(inputIcon),
        }),
        h(MenuItem, {
          primary: props.ctx.t('l18n.renderer'),
          renderEnd: (endProps) =>
            h(Box, {}, [h(Text, { ...endProps, text: VDomImplWeb.toName(props.model.renderer.render_vDomImpl) })]),
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
