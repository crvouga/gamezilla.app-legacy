import { LocalStorage } from '~/@/browser'
import { replaceQueryParam } from '~/@/browser/browser'
import { LanguageCodeISO_639_1 } from '~/@/l18n'
import { Sub } from '~/@/sub'
import { Gutter } from '~/@/ui/gutter'
import { IconCode, IconGear, IconLanguage } from '~/@/ui/icon'
import { ListItemButton } from '~/@/ui/list-item-button'
import { RadioInputIcon } from '~/@/ui/radio-input'
import { h } from '~/@/vdom/h'
import { VDomImpl } from '~/@/vdom/vdom-impl'
import { CloseStatusBarCmd } from '~/app/@/frontend/close-status-bar-cmd.$msg'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { PushScreenCmd } from '~/app/@/frontend/push-screen-cmd.$msg'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import { APP_SOUND } from '../@/frontend/app-sound'
import { AppFrontendCtxBase } from '../@/frontend/ctx'
import { ReplaceScreenCmd } from '../@/frontend/replace-screen-cmd.$msg'
import { translatorSubscriptions } from '../@/frontend/translator'
import type { FrontendModule, ModelFrontend, MsgFrontend, TranslationLoading } from './types'

const dataTestId = {
  screen: 'settings/screen',
  openSettingsScreen: 'settings/open-settings-screen',
  openChooseLangScreen: 'settings/open-choose-lang-screen',
  chooseLangScreen: 'settings/choose-lang-screen',
  openChooseRendererScreen: 'settings/open-choose-renderer-screen',
  chooseRendererScreen: 'settings/choose-renderer-screen',
  chooseRendererListItem: (vDomImpl: VDomImpl) => `settings/choose-renderer-list-item-${vDomImpl}`,
}

//
//
//
//
//
//
//

const LANG_STORAGE_KEY = 'lang'

const init: FrontendModule['init'] = ({ ctx }) => {
  const initialLang = LanguageCodeISO_639_1.is(ctx.navigatorLanguage) ? ctx.navigatorLanguage : 'en'

  return {
    model: {
      lang: initialLang,
      langLoading: {},
      vDomImpl: VDomImpl.readFromUrl({ fallback: 'snabbdom' }),
    },
  }
}

//
//
//
//
//
//
//

const update: FrontendModule['update'] = ({ model, ctx, msg }) => {
  if (!msg) return { model }

  switch (msg?.t) {
    case 'translator.loaded': {
      const loadingNew: TranslationLoading = {
        startedAt: model.langLoading?.[msg.lang]?.startedAt ?? ctx.now,
        endedAt: ctx.now,
      }
      return {
        model: {
          ...model,
          langLoading: {
            ...model.langLoading,
            [msg.lang]: loadingNew,
          },
        },
      }
    }

    case 'translator.loading': {
      return {
        model: {
          ...model,
          langLoading: {
            ...model.langLoading,
            [msg.lang]: {
              startedAt: ctx.now,
              endedAt: null,
            },
          },
        },
      }
    }

    case 'clicked-change-lang': {
      if (ctx.currentScreen.n === 'settings' && ctx.currentScreen.t === 'choose-lang') {
        return {
          model,
          msgOut: [PlaySoundCmd.init(APP_SOUND.navForwardMin), CloseStatusBarCmd.init()],
        }
      }

      return {
        model,
        msgOut: [PushScreenCmd.init({ t: 'choose-lang', n: 'settings' }, true), CloseStatusBarCmd.init()],
      }
    }

    case 'choose-renderer.clicked-back-button': {
      return {
        model,
        msgOut: [ReplaceScreenCmd.init({ t: 'main', n: 'settings' }, true)],
      }
    }

    case 'choose-lang.clicked-back-button': {
      return {
        model,
        msgOut: [ReplaceScreenCmd.init({ t: 'main', n: 'settings' }, true)],
      }
    }

    case 'choose-lang.clicked-lang': {
      return {
        model: {
          ...model,
          lang: msg.lang,
        },
        msgOut: [PlaySoundCmd.init(APP_SOUND.tap)],
        eff: LocalStorage.put(LANG_STORAGE_KEY, msg.lang),
      }
    }

    case 'clicked-change-renderer': {
      return {
        model,
        msgOut: [PushScreenCmd.init({ t: 'choose-renderer', n: 'settings' }, true), CloseStatusBarCmd.init()],
      }
    }

    case 'clicked-open-settings': {
      return {
        model,
        msgOut: [PushScreenCmd.init({ t: 'main', n: 'settings' }, true), CloseStatusBarCmd.init()],
      }
    }

    case 'clicked-back-button': {
      return {
        model,
        msgOut: [ReplaceScreenCmd.init({ t: 'login', n: 'auth' }, true)],
      }
    }

    case 'choose-renderer.clicked-renderer': {
      return {
        model: {
          ...model,
          vDomImpl: msg.vDomImpl,
        },
        msgOut: [PlaySoundCmd.init(APP_SOUND.tap)],
        async eff(dispatch) {
          replaceQueryParam('vdom', msg.vDomImpl)(dispatch)
          await new Promise((resolve) => setTimeout(resolve, 100))
          window.location.reload()
        },
      }
    }

    default: {
      return {
        model,
      }
    }
  }
}

//
//
//
//
//
//
//

const subscriptions: FrontendModule['subscriptions'] = (_input) => {
  return Sub.map(translatorSubscriptions, (c): MsgFrontend => c)
}

//
//
//
//
//
//
//

const ViewLangListItem: FrontendModule['View'] = ({ model, ctx, dispatch }) => {
  return h(ListItemButton, {
    icon: (input) => h(IconLanguage, input),
    primary: ctx.t('l18n.language'),
    end: () => ctx.t(model.lang),
    onClick: () => {
      dispatch({
        t: 'clicked-change-lang',
      })
    },
  })
}

const ViewSettingsListItem: FrontendModule['View'] = (input) => {
  return h(ListItemButton, {
    icon: (props) => h(IconGear, props),
    primary: input.ctx.t('l18n.settings'),
    dataTestId: dataTestId.openSettingsScreen,
    // end: () => h(IconChevronRight, { class: 'size-6' }),
    onClick: () => input.dispatch({ t: 'clicked-open-settings' }),
  })
}

const View: FrontendModule['View'] = (input) => {
  switch (input.ctx.currentScreen.n) {
    case 'settings': {
      switch (input.ctx.currentScreen.t) {
        case 'main': {
          return h(ViewMain, { ctx: input.ctx, dispatch: input.dispatch, model: input.model })
        }
        case 'choose-lang': {
          return h(ViewChooseLang, { ctx: input.ctx, dispatch: input.dispatch, model: input.model })
        }
        case 'choose-renderer': {
          return h(ViewChooseRenderer, { ctx: input.ctx, dispatch: input.dispatch, model: input.model })
        }
        default: {
          return null
        }
      }
    }
    default: {
      return null
    }
  }
}

const ViewMain: FrontendModule['View'] = (input) => {
  return h(ScreenLayout, {
    id: 'setting-main',
    dataTestId: dataTestId.screen,
    ctx: input.ctx,
    parentScreen: input.ctx.parentScreen,
    navBar: {
      title: input.ctx.t('l18n.settings'),
      back: { onClick: () => input.dispatch({ t: 'clicked-back-button' }) },
    },
    renderBody: () =>
      h('div', { class: 'flex flex-1 flex-col overflow-y-scroll' }, [
        h(ListItemButton, {
          primary: input.ctx.t('l18n.language'),
          end: () => h('div', {}, [input.ctx.t(input.model.lang)]),
          onClick: () => input.dispatch({ t: 'clicked-change-lang' }),
          link: true,
          icon: (inputIcon) => h(IconLanguage, inputIcon),
        }),
        h(ListItemButton, {
          primary: input.ctx.t('l18n.renderer'),
          end: () => h('div', {}, [VDomImpl.toName(input.model.vDomImpl)]),
          onClick: () => input.dispatch({ t: 'clicked-change-renderer' }),
          icon: (inputIcon) => h(IconCode, inputIcon),
          link: true,
          dataTestId: dataTestId.openChooseRendererScreen,
        }),
        h(Gutter, { variant: 'screen' }),
      ]),
  })
}

const ViewChooseRenderer: FrontendModule['View'] = (input) => {
  return h(ScreenLayout, {
    id: 'setting-choose-renderer',
    dataTestId: dataTestId.chooseRendererScreen,
    ctx: input.ctx,
    parentScreen: input.ctx.parentScreen,
    navBar: {
      title: input.ctx.t('l18n.renderer'),
      back: {
        onClick: () => input.dispatch({ t: 'choose-renderer.clicked-back-button' }),
      },
    },
    renderBody: () =>
      h('div', { class: 'flex flex-1 flex-col overflow-y-scroll' }, [
        ...VDomImpl.ALL.filter((vDomImpl) => !VDomImpl.HIDDEN.includes(vDomImpl)).map((vDomImpl) => {
          const isSelected = vDomImpl === input.model.vDomImpl
          // const isDefault = vDomImpl === CONFIG_FRONTEND.VDOM_IMPL_DEFAULT
          return h(ListItemButton, {
            key: vDomImpl,
            primary: VDomImpl.toName(vDomImpl),
            // secondary: isDefault ? input.ctx.t('l18n.default') : undefined,
            dataTestId: dataTestId.chooseRendererListItem(vDomImpl),
            onClick: () => input.dispatch({ t: 'choose-renderer.clicked-renderer', vDomImpl }),
            end: () => h(RadioInputIcon, { class: 'size-7', status: isSelected ? 'selected' : 'unselected' }),
          })
        }),
        h(Gutter, { variant: 'screen' }),
      ]),
  })
}

const ViewChooseLang: FrontendModule['View'] = (input) => {
  return h(ScreenLayout, {
    id: 'setting-choose-lang',
    dataTestId: dataTestId.chooseLangScreen,
    ctx: input.ctx,
    parentScreen: input.ctx.parentScreen,
    navBar: {
      title: input.ctx.t('l18n.language'),
      back: { onClick: () => input.dispatch({ t: 'choose-lang.clicked-back-button' }) },
    },
    renderBody: () =>
      h('div', { class: 'flex flex-1 flex-col overflow-y-scroll' }, [
        ...LanguageCodeISO_639_1.ALL.map((langCode) =>
          h(ViewChooseLangListItem, {
            key: langCode,
            ctx: input.ctx,
            langCode,
            model: input.model,
            dispatch: input.dispatch,
          }),
        ),
        h(Gutter, { variant: 'screen' }),
      ]),
  })
}

const ViewChooseLangListItem = (input: {
  ctx: AppFrontendCtxBase
  langCode: LanguageCodeISO_639_1
  model: ModelFrontend
  dispatch: (msg: MsgFrontend) => void
}) => {
  return h(ListItemButton, {
    link: true,
    key: input.langCode,
    primary: input.ctx.t(input.langCode),
    end: () => h('div', {}, [input.ctx.t(input.langCode)]),
    onClick: () => input.dispatch({ t: 'choose-lang.clicked-lang', lang: input.langCode }),
    icon: (inputIcon) => h(RadioInputIcon, { class: inputIcon.class, status: toStatus(input) }),
  })
}

const toStatus = (input: { langCode: LanguageCodeISO_639_1; model: ModelFrontend; ctx: AppFrontendCtxBase }) => {
  if (input.model.langLoading[input.langCode]?.endedAt === null) {
    return 'loading'
  }

  if (input.model.lang === input.langCode) {
    return 'selected'
  }

  return 'unselected'
}

export const SettingsFrontend = {
  init,
  update,
  subscriptions,
  dataTestId,
  ViewLangListItem,
  ViewSettingsListItem,
  View,
}
