import {
  APP_SOUND,
  AnonymousClientCtx,
  ClientCmd,
  ClientCtx,
  ClientEvent,
  back,
  closeStatusBar,
  playSound,
  pushRoute,
} from "gamezilla-app/@CHILD/app/@SHARED/client"
import { LocalStorage } from "gamezilla-app/@SHARED/core"
import { LanguageCodeISO_639_1 } from "gamezilla-app/@SHARED/l18n"
import { translations } from "gamezilla-app/@SHARED/l18n/lang-code-iso-639-1/lang-code-iso-639-1.l18n"
import { AppClientModule } from "../../@SHARED/architecture/app-client"
import { translatorSubscriptions } from "../../@SHARED/client/translator"
import {
  Button,
  IconCheckmarkCircle,
  IconCheckmarkCircleEmpty,
  IconLanguage,
  ListItemButton,
  Spinner,
  TopBar,
} from "../../@SHARED/ui"
import {
  ModelClient,
  MsgClient,
  MsgToClient,
  MsgToServer,
  TranslationLoading,
} from "./lang.core"

//
//
//
//
//
//
//

type Module = AppClientModule<{
  Ctx: AnonymousClientCtx | ClientCtx
  Model: ModelClient
  MsgToServer: MsgToServer
  MsgToClient: MsgToClient
  Msg: MsgClient
  MsgInCmd: null
  MsgInEvent: ClientEvent
  MsgOutCmd: ClientCmd<{ MsgToServer: MsgToServer; MsgClient: MsgClient }>
  MsgOutEvent: null
}>

//
//
//
//
//
//
//

const LANG_STORAGE_KEY = "lang"

export const init: Module["init"] = ({ stored, ctx }) => {
  const storedLang = stored?.[LANG_STORAGE_KEY]

  const initialLang = LanguageCodeISO_639_1.is(storedLang)
    ? storedLang
    : ctx.navigatorLanguage

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

export const update: Module["update"] = ({ model, ctx, msg }) => {
  switch (msg?.t) {
    case "translator.loaded": {
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

    case "translator.loading": {
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

    case "clicked-change-lang": {
      if (
        ctx.currentRoute.n === "lang" &&
        ctx.currentRoute.t === "choose-lang"
      ) {
        return {
          model,
          msgCmd: [playSound(APP_SOUND.navForwardMin), closeStatusBar()],
        }
      }

      return {
        model,
        msgCmd: [
          playSound(APP_SOUND.navForwardMin),
          pushRoute({
            t: "choose-lang",
            n: "lang",
          }),
          closeStatusBar(),
        ],
      }
    }

    case "choose-lang.clicked-done": {
      return {
        model,
        msgCmd: [playSound(APP_SOUND.navBackwardMin), back()],
      }
    }

    case "choose-lang.clicked-lang": {
      return {
        model: { ...model, lang: msg.lang },
        msgCmd: [playSound(APP_SOUND.tap)],
        eff: LocalStorage.put(LANG_STORAGE_KEY, msg.lang),
      }
    }

    default: {
      return { model }
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

export const subscriptions: Module["subscriptions"] = () => {
  return translatorSubscriptions
}

//
//
//
//
//
//
//

export const ViewStatusBarDrawer: Module["View"] = ({
  model,
  ctx,
  dispatch,
}) => {
  return (
    <ListItemButton
      icon={(props) => <IconLanguage {...props} />}
      label={ctx.t("lang.language")}
      end={() => ctx.t(model.lang)}
      onClick={() => dispatch({ t: "clicked-change-lang" })}
    />
  )
}

export const View: Module["View"] = ({ ctx, dispatch, model }) => {
  switch (ctx.currentRoute.n) {
    case "lang": {
      switch (ctx.currentRoute.t) {
        case "choose-lang": {
          return <ViewChooseLang ctx={ctx} dispatch={dispatch} model={model} />
        }
      }
    }
    default: {
      return null
    }
  }
}

const ViewChooseLang: Module["View"] = ({ ctx, dispatch, model }) => {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden">
      <TopBar title={ctx.t("lang.choose-language")} />
      <div className="flex flex-1 flex-col divide-y divide-neutral-700 overflow-y-scroll">
        {LanguageCodeISO_639_1.ALL.map((code) => {
          return (
            <ListItemButton
              label={translations[code][code]}
              icon={(props) => {
                if (model.loading[code]?.endedAt === null) {
                  return <Spinner {...props} />
                }

                if (model.lang === code) {
                  return <IconCheckmarkCircle {...props} />
                }
                return <IconCheckmarkCircleEmpty {...props} />
              }}
              end={() => <p>{ctx.t(code)}</p>}
              onClick={() =>
                dispatch({ t: "choose-lang.clicked-lang", lang: code })
              }
            />
          )
        })}
        <div className="w-full p-8"></div>
      </div>
      <div className="w-full border-t border-t-neutral-800 p-4">
        <Button
          onClick={() => dispatch({ t: "choose-lang.clicked-done" })}
          text={ctx.t("lang.done")}
          className="w-full"
        />
      </div>
    </div>
  )
}
