import {
  AnonymousClientCtx,
  ClientCmd,
  ClientEvent,
} from "gamezilla-app/@CHILD/app/@SHARED/client"
import { AppClientModule } from "../../@SHARED/architecture/app-client"
import { translatorSub } from "../../@SHARED/client/translator"
import { IconLanguage, ListItemButton } from "../../@SHARED/ui"
import { ModelClient, MsgClient, MsgToClient, MsgToServer } from "./lang.core"

//
//
//
//
//
//
//

type Module = AppClientModule<{
  Ctx: AnonymousClientCtx
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

export const init: Module["init"] = () => {
  return {
    model: {
      lang: "en",
      isLoadingTranslator: false,
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

export const update: Module["update"] = ({ model, msg }) => {
  switch (msg?.t) {
    case "translator.loaded": {
      return { model: { ...model, isLoadingTranslator: false } }
    }
    case "translator.loading": {
      return { model: { ...model, isLoadingTranslator: true } }
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
  return translatorSub
}

//
//
//
//
//
//
//

export const ViewStatusBarDrawer: Module["View"] = ({ model, ctx }) => {
  return (
    <ListItemButton
      icon={(props) => <IconLanguage {...props} />}
      label={ctx.t("Language")}
      end={() => ctx.t(model.lang)}
    />
  )
}
