import { Eff } from '~/@/eff'
import { LanguageCodeISO_639_1, TranslatedText } from '~/@/l18n'
import { translations } from '~/@/l18n/generated'
import { Sub } from '~/@/sub'
import { Gutter } from '~/@/ui/gutter'
import { MenuItem } from '~/@/ui/menu-item'
import { RadioInputIcon } from '~/@/ui/radio-input'
import { h } from '~/@/vdom/h'
import { ScrollBox } from '~/@/vdom/primitives/scroll-box'
import { Text } from '~/@/vdom/primitives/text'
import { sx } from '~/@/vdom/style/sx'
import { playSound } from '~/app/@/frontend/sound-cmd'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import { back } from '~/app/frontend/current-screen/current-screen-cmd'
import { APP_SOUND } from '../../@/frontend/app-sound'
import { AppFrontendCtxBase } from '../../@/frontend/ctx'
import { ModelFrontend, MsgFrontend } from './types'

const LANG_STORAGE_KEY = 'lang'

const init = (input: { ctx: AppFrontendCtxBase }): { model: ModelFrontend; eff?: Eff<MsgFrontend> } => {
  const initialLang = LanguageCodeISO_639_1.is(input.ctx.navigatorLanguage) ? input.ctx.navigatorLanguage : 'en'

  return {
    model: {
      lang_lang: initialLang,
      lang_loading: {},
    },
  }
}

const update = (input: {
  ctx: AppFrontendCtxBase
  model: ModelFrontend
  msg: MsgFrontend
}): {
  model: ModelFrontend
  eff?: Eff<MsgFrontend>
} => {
  switch (input.msg.t) {
    case 'lang_clickedBackButton': {
      return { model: input.model, eff: back() }
    }

    case 'lang_clickedLang': {
      const lang = input.msg.lang
      return {
        model: {
          ...input.model,
          lang_lang: lang,
        },

        eff: Eff.batch([
          playSound(APP_SOUND.tap),
          () => {
            input.ctx.keyValueDb.set(LANG_STORAGE_KEY, lang)
          },
        ]),
      }
    }

    default: {
      return {
        model: input.model,
      }
    }
  }
}

const subscriptions = (_input: { ctx: AppFrontendCtxBase; model: ModelFrontend }): Sub<MsgFrontend> => {
  return Sub.none()
}

export const TEST_ID_LANG_SCREEN = 'settings/lang-screen'

const View = (input: { ctx: AppFrontendCtxBase; model: ModelFrontend; dispatch: (msg: MsgFrontend) => void }) => {
  return h(ScreenLayout, {
    id: 'setting-choose-lang',
    dataTestId: TEST_ID_LANG_SCREEN,
    ctx: input.ctx,
    parentScreen: input.ctx.parentScreen,
    navBar: {
      title: input.ctx.t('l18n.language'),
      back: { onPress: () => input.dispatch({ t: 'lang_clickedBackButton' }) },
    },
    renderBody: () =>
      h(ScrollBox, { style: sx({ flexDirection: 'col', flex: 1 }) }, [
        ...LanguageCodeISO_639_1.ALL.map((langCode) =>
          h(ViewChooseLangMenuItem, {
            key: langCode,
            ctx: input.ctx,
            langCode,
            model: input.model,
            dispatch: (c) => input.dispatch(c),
          }),
        ),
        h(Gutter, { variant: 'screen' }),
      ]),
  })
}

const ViewChooseLangMenuItem = (input: {
  ctx: AppFrontendCtxBase
  langCode: LanguageCodeISO_639_1
  model: ModelFrontend
  dispatch: (msg: MsgFrontend) => void
}) => {
  const primary = translations[input.langCode][input.langCode]
  return h(MenuItem, {
    link: true,
    primary: TranslatedText.of(primary),
    renderEnd: () => h(Text, { style: sx({ textColor: 'white', fontSize: 'lg' }), text: input.ctx.t(input.langCode) }),
    onPress: () => input.dispatch({ t: 'lang_clickedLang', lang: input.langCode }),
    renderIcon: (iconProps) => h(RadioInputIcon, { ...iconProps, status: toStatus(input) }),
  })
}

const toStatus = (input: { langCode: LanguageCodeISO_639_1; model: ModelFrontend; ctx: AppFrontendCtxBase }) => {
  if (input.model.lang_loading?.[input.langCode]?.endedAt === null) return 'loading'
  if (input.model.lang_lang === input.langCode) return 'selected'
  return 'unselected'
}

export const ScreenLangFrontend = {
  init,
  update,
  subscriptions,
  View,
}
