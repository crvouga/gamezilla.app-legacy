import { ClientCmd, ClientEvent } from "gamezilla-app/@CHILD/app/@SHARED/client"
import { Posix, Sub } from "gamezilla-app/@SHARED/core"
import { AppClientModule } from "../../@SHARED/architecture/app-client"
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
  Ctx: { now: Posix }
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

export const update: Module["update"] = ({ model }) => {
  return { model }
}

//
//
//
//
//
//
//

export const subscriptions: Module["subscriptions"] = () => {
  return Sub.None
}

//
//
//
//
//
//
//

export const ViewStatusBarDrawer: Module["View"] = ({ model }) => {
  return (
    <ListItemButton
      icon={(props) => <IconLanguage {...props} />}
      label="Language"
      end={() => model.lang}
    />
  )
}
