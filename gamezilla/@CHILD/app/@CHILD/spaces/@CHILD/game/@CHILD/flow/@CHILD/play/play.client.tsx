import { GameClientModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2"
import { withId } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event"
import { SpaceClientEvent } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space"
import { ClientCmd } from "gamezilla/@CHILD/app/@SHARED/client"
import { Button, IconArrowLeftOnRect } from "gamezilla/@CHILD/app/@SHARED/ui"
import { Sub } from "gamezilla/@SHARED/core"
import { GameLayout } from "../../../../@SHARED/game"
import { FlowVariantUIPlay } from "../../@SHARED/flow"
import { FlowClientCtx } from "../../@SHARED/flow-ctx"
import { samples } from "../../@SHARED/flow/flow-variant/flow-grid/flow-grid-samples"
import { ViewProfileCard } from "../../@SHARED/ui"
import {
  ModelClient,
  ModelSync,
  MsgClient,
  MsgSync,
  MsgToClient,
  MsgToServer,
} from "./play.core"

type Module = GameClientModule<{
  Model: ModelClient
  Msg: MsgClient
  MsgToClient: MsgToClient
  MsgToServer: MsgToServer
  MsgSync: MsgSync
  ModelSync: ModelSync
  Ctx: FlowClientCtx
  MsgOutCmd: ClientCmd<{ MsgToServer: MsgToServer; MsgClient: MsgClient }>
  MsgInEvent: SpaceClientEvent
  MsgOutEvent: null
  MsgInCmd: null
}>

const flow = samples["8x8"][0]
const init: Module["init"] = {
  play: FlowVariantUIPlay.init({ flow }),
  flow,
}

const update: Module["update"] = (input) => {
  return GameClientModule.chainUpdates(
    { model: input.model },
    //
    (model) => updateFromMsg({ ...input, model }),
  )
}

const updateFromMsg: Module["update"] = (input) => {
  const { msg, model } = input

  if (!msg) {
    return { model }
  }

  switch (msg.t) {
    case "grid": {
      const updated = FlowVariantUIPlay.update({
        msg: msg.c,
        model: model.play,
        flow: model.flow,
      })
      return {
        model: {
          play: updated,
          flow: model.flow,
        },
      }
    }

    case "msgSync": {
      const msgSync = withId(msg.c)
      return {
        model,
        msgSync: [msgSync],
      }
    }
  }
}

const subscriptions: Module["subscriptions"] = () => {
  return Sub.None
}

const USE_GAME_STATE = true

const View: Module["View"] = ({ model, modelSync, dispatch, ctx }) => {
  const isPlaying = ctx.currentUserId === ctx.space.hostId
  const isSpectating = !isPlaying
  const host = ctx.profiles[ctx.space.hostId]
  return (
    <GameLayout isSpectating={isSpectating}>
      <div className="flex w-full flex-1 flex-col items-center justify-center">
        {isSpectating && host && (
          <ViewProfileCard profile={host} subtitle="Player" />
        )}
        {USE_GAME_STATE ? (
          <FlowVariantUIPlay.View
            dispatch={(c) => dispatch({ t: "msgSync", c: { t: "grid", c } })}
            model={modelSync.play}
            disabled={isSpectating}
            flow={modelSync.flow}
          />
        ) : (
          <FlowVariantUIPlay.View
            dispatch={(c) => dispatch({ t: "grid", c })}
            model={model.play}
            flow={model.flow}
            disabled={isSpectating}
          />
        )}
      </div>
      {isPlaying && (
        <div className="w-full p-4">
          <Button
            className="w-full"
            onClick={ctx.onQuit}
            start={<IconArrowLeftOnRect className="h-6 w-6" />}
            text="Exit"
          />
        </div>
      )}
    </GameLayout>
  )
}

export const ViewFeedItem: Module["ViewFeedItem"] = ({ msgSync }) => {
  switch (msgSync.t) {
    case "grid": {
      switch (msgSync.c.t) {
        case "dragged-over":
        case "left":
        case "pressed-down":
        case "pressed-up": {
          return null
        }
        default: {
          return null
        }
      }
    }
  }
}

export const PlayClient: Module = {
  init,
  update,
  subscriptions,
  View,
  ViewFeedItem,
}
