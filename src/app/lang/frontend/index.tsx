import { LocalStorage } from '~/@/browser'
import { LanguageCodeISO_639_1 } from '~/@/l18n'
import { Gutter } from '~/app/@/ui/gutter'
import { ScreenLayout } from '~/app/@/screen/screen-layout'
import { APP_SOUND, back, closeStatusBar, playSound, pushScreen } from '../../@/frontend/cmd'
import { translatorSubscriptions } from '../../@/frontend/translator'
import { IconCheckmarkCircle, IconCheckmarkCircleEmpty, IconLanguage, ListItemButton, Spinner } from '../../@/ui'
import type { FrontendModule, TranslationLoading } from '../types'

//
//
//
//
//
//
//

const LANG_STORAGE_KEY = 'lang'

export const init: FrontendModule['init'] = ({ stored, ctx }) => {
  const storedLang = stored?.[LANG_STORAGE_KEY]

  const initialLang = LanguageCodeISO_639_1.is(storedLang) ? storedLang : ctx.navigatorLanguage

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

export const update: FrontendModule['update'] = ({ model, ctx, msg }) => {
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
          msgCmd: [playSound(APP_SOUND.navForwardMin), closeStatusBar()],
        }
      }

      return {
        model,
        msgCmd: [
          playSound(APP_SOUND.navForwardMin),
          pushScreen({
            t: 'choose-lang',
            n: 'lang',
          }),
          closeStatusBar(),
        ],
      }
    }

    case 'choose-lang.clicked-done': {
      return {
        model,
        msgCmd: [playSound(APP_SOUND.navBackwardMin), back()],
      }
    }

    case 'choose-lang.clicked-lang': {
      return {
        model: {
          ...model,
          lang: msg.lang,
        },
        msgCmd: [playSound(APP_SOUND.tap)],
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

export const subscriptions: FrontendModule['subscriptions'] = () => {
  return translatorSubscriptions
}

//
//
//
//
//
//
//

export const ViewStatusBarDrawer: FrontendModule['View'] = ({ model, ctx, dispatch }) => {
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

export const View: FrontendModule['View'] = (input) => {
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
      topBar={{
        title: input.ctx.t('lang.choose-language'),
        onBack: () =>
          input.dispatch({
            t: 'choose-lang.clicked-done',
          }),
      }}
      main={
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
      }
    />
  )
}
