import { LocalStorage } from '~/@/browser'
import { LanguageCodeISO_639_1 } from '~/@/l18n'
import { Sub } from '~/@/sub'
import { Gutter } from '~/@/ui/gutter'
import { IconCheckmarkCircle, IconCheckmarkCircleEmpty } from '~/@/ui/icon/icon-checkmark-circle'
import { IconLanguage } from '~/@/ui/icon/icon-language'
import { ListItemButton } from '~/@/ui/list-item-button'
import { Spinner } from '~/@/ui/spinner'
import { BackScreenCmd } from '~/app/@/frontend/back-screen-cmd.$msg'
import { CloseStatusBarCmd } from '~/app/@/frontend/close-status-bar-cmd.$msg'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { PushScreenCmd } from '~/app/@/frontend/push-screen-cmd.$msg'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import { APP_SOUND } from '../../@/frontend/app-sound'
import { translatorSubscriptions } from '../../@/frontend/translator'
import type { FrontendModule, MsgFrontend, TranslationLoading } from '../types'

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
      loading: {},
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
        startedAt: model.loading?.[msg.lang]?.startedAt ?? ctx.now,
        endedAt: ctx.now,
      }
      return {
        model: {
          ...model,
          loading: {
            ...model.loading,
            [msg.lang]: loadingNew,
          },
        },
      }
    }

    case 'translator.loading': {
      return {
        model: {
          ...model,
          loading: {
            ...model.loading,
            [msg.lang]: {
              startedAt: ctx.now,
              endedAt: null,
            },
          },
        },
      }
    }

    case 'clicked-change-lang': {
      if (ctx.currentScreen.n === 'lang' && ctx.currentScreen.t === 'choose-lang') {
        return {
          model,
          msgOut: [PlaySoundCmd.init(APP_SOUND.navForwardMin), CloseStatusBarCmd.init()],
        }
      }

      return {
        model,
        msgOut: [
          PlaySoundCmd.init(APP_SOUND.navForwardMin),
          PushScreenCmd.init({
            t: 'choose-lang',
            n: 'lang',
          }),
          CloseStatusBarCmd.init(),
        ],
      }
    }

    case 'choose-lang.clicked-done': {
      return {
        model,
        msgOut: [PlaySoundCmd.init(APP_SOUND.navBackwardMin), BackScreenCmd.init()],
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
  return (
    <ListItemButton
      icon={(input) => <IconLanguage {...input} />}
      label={ctx.t('lang.language')}
      end={() => ctx.t(model.lang)}
      onClick={() =>
        dispatch({
          t: 'clicked-change-lang',
        })
      }
    />
  )
}

const View: FrontendModule['View'] = (input) => {
  switch (input.ctx.currentScreen.n) {
    case 'lang': {
      switch (input.ctx.currentScreen.t) {
        case 'choose-lang': {
          return <ViewChooseLang ctx={input.ctx} dispatch={input.dispatch} model={input.model} />
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

const ViewChooseLang: FrontendModule['View'] = (input) => {
  return (
    <ScreenLayout
      id='choose-lang'
      ctx={input.ctx}
      parentScreen={input.ctx.parentScreen}
      navBar={{
        title: input.ctx.t('lang.choose-language'),
        back: {
          onClick: () =>
            input.dispatch({
              t: 'choose-lang.clicked-done',
            }),
        },
      }}
      renderBody={() => (
        <div className='flex flex-1 flex-col overflow-y-scroll'>
          {LanguageCodeISO_639_1.ALL.map((code) => (
            <ListItemButton
              key={code}
              label={input.ctx.t(code)}
              icon={(inputIcon) => {
                if (input.model.loading[code]?.endedAt === null) {
                  return <Spinner {...inputIcon} />
                }

                if (input.model.lang === code) {
                  return <IconCheckmarkCircle {...inputIcon} />
                }

                return <IconCheckmarkCircleEmpty {...inputIcon} />
              }}
              end={() => <div>{input.ctx.t(code)}</div>}
              onClick={() =>
                input.dispatch({
                  t: 'choose-lang.clicked-lang',
                  lang: code,
                })
              }
            />
          ))}
          <Gutter variant='screen' />
        </div>
      )}
    />
  )
}

export const LangFrontend = {
  init,
  update,
  subscriptions,
  ViewLangListItem,
  View,
}
