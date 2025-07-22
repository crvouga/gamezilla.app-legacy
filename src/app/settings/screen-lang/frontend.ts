import { LanguageCodeISO_639_1, TranslatedText } from '~/@/l18n'
import { Box } from '~/@/vdom/primitives/box'
import { translations } from '~/@/l18n/generated'
import { Sub } from '~/@/sub'
import { Gutter } from '~/@/ui/gutter'
import { ListItem } from '~/@/ui/list-item'
import { RadioInputIcon } from '~/@/ui/radio-input'
import { h } from '~/@/vdom/h'
import { BackScreenCmd } from '~/app/@/frontend/back-screen-cmd.$msg'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import { APP_SOUND } from '../../@/frontend/app-sound'
import { AppFrontendCtxBase } from '../../@/frontend/ctx'
import { FrontendModule } from '../types'
import { ModelFrontend, MsgFrontend } from './types'

const LANG_STORAGE_KEY = 'lang'

const init = (input: { ctx: AppFrontendCtxBase }): { model: ModelFrontend } => {
  const initialLang = LanguageCodeISO_639_1.is(input.ctx.navigatorLanguage) ? input.ctx.navigatorLanguage : 'en'

  return {
    model: {
      lang: initialLang,
      langLoading: {},
    },
  }
}

const update: FrontendModule['update'] = (input) => {
  if (!input.msg) return { model: input.model }

  switch (input.msg?.t) {
    case 'lang.clicked-back-button': {
      return { model: input.model, msgOut: [BackScreenCmd.init()] }
    }

    case 'lang.clicked-lang': {
      const { lang } = input.msg
      return {
        model: {
          ...input.model,
          lang,
        },
        msgOut: [PlaySoundCmd.init(APP_SOUND.tap)],
        async eff(_dispatch) {
          await input.ctx.keyValueDb.set(LANG_STORAGE_KEY, lang)
        },
      }
    }

    default: {
      return {
        model: input.model,
      }
    }
  }
}

const subscriptions: FrontendModule['subscriptions'] = (_input) => {
  return Sub.none()
}

export const TEST_ID_LANG_SCREEN = 'settings/lang-screen'

const View: FrontendModule['View'] = (input) => {
  return ScreenLayout({
    id: 'setting-choose-lang',
    dataTestId: TEST_ID_LANG_SCREEN,
    ctx: input.ctx,
    parentScreen: input.ctx.parentScreen,
    navBar: {
      title: input.ctx.t('l18n.language'),
      back: { onClick: () => input.dispatch({ t: 'lang.clicked-back-button' }) },
    },
    renderBody: () =>
      h(Box, { class: 'flex flex-1 flex-col overflow-y-scroll' }, [
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
  const primary = translations[input.langCode][input.langCode]
  return ListItem({
    link: true,
    primary: TranslatedText.of(primary),
    end: () => h(Box, {}, [input.ctx.t(input.langCode)]),
    onClick: () => input.dispatch({ t: 'lang.clicked-lang', lang: input.langCode }),
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

export const ScreenLangFrontend = {
  init,
  update,
  subscriptions,
  View,
}
