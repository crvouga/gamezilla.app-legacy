import { Sub } from "gamezilla-app/@SHARED/core"
import { ClientCmd } from "gamezilla-app/app/@SHARED/client"
import { GameClient } from "gamezilla-app/app/spaces/@SHARED/architecture/game-client"
import {
  SpaceClientCtx,
  SpaceClientEvent,
} from "gamezilla-app/app/spaces/@SHARED/space"
import { GameMainMenu } from "gamezilla-app/app/spaces/game/@SHARED/game"
import { CoverArt } from "./@SHARED/tic-tic-toe/tic-tac-toe-ui"
import {
  ModelClient,
  MsgClient,
  MsgToClient,
  MsgToServer,
} from "./tic-tac-toe.core"
import * as VsBot from "./vs-bot/vs-bot.client"
import * as VsUser from "./vs-user/vs-user.client"

type Client = GameClient<{
  ModelClient: ModelClient
  MsgClient: MsgClient
  MsgToClient: MsgToClient
  MsgToServer: MsgToServer
  MsgSync: null
  ModelSync: null
  ClientCtx: SpaceClientCtx
  ClientCmd: ClientCmd<{ MsgToServer: MsgToServer; MsgClient: MsgClient }>
  ClientEvent: SpaceClientEvent
}>

//
//
//
// Model
//
//
//

export const init: Client["init"] = ({ model }) => {
  if (model) {
    return { model }
  }

  return { model: { t: "none" } }
}

//
//
// Update
//
//
//

export const update: Client["update"] = (input) => {
  return init(input)
}

//
//
//
// Subscriptions
//
//
//

export const subscriptions: Client["subscriptions"] = () => {
  return Sub.None
}

//
//
//
// View
//
//
//

export const View = ({
  ctx,
  model,
  dispatch,
}: {
  ctx: SpaceClientCtx
  model: ModelClient
  dispatch: (msg: MsgClient) => void
}) => {
  const onQuit = () => dispatch({ t: "input-mode", mode: "none" })

  if (model.t === "none") {
    return (
      <GameMainMenu.View
        dispatch={dispatch}
        title="Tic-Tac-Toe"
        ctx={ctx}
        renderCoverArt={(props) => <CoverArt {...props} key={props.key} />}
        buttons={[
          GameMainMenu.buttons.playFriend({
            onClick: () => dispatch({ t: "input-mode", mode: "vs-user" }),
          }),
          GameMainMenu.buttons.playComputer({
            onClick: () => dispatch({ t: "input-mode", mode: "vs-bot" }),
          }),
        ]}
      />
    )
  }

  if (model.t === "vs-user") {
    return (
      <VsUser.View
        onCloseGame={onQuit}
        ctx={ctx}
        model={model.c}
        dispatch={(c) => dispatch({ t: "vs-user", c })}
      />
    )
  }

  if (model.t === "vs-bot") {
    return (
      <VsBot.View
        goBack={onQuit}
        ctx={ctx}
        model={model.c}
        dispatch={(c) => dispatch({ t: "vs-bot", c })}
      />
    )
  }

  const check: never = model
  return check
}
