import { Sub, Time, TimeSpan, isErr } from 'gamezilla-app/@/core'
import { withEventId } from 'gamezilla-app/app/spaces/@/event'
import type { SpaceServerCmd } from 'gamezilla-app/app/spaces/@/space-server-cmd'
import { SpaceServerCtx } from 'gamezilla-app/app/spaces/@/space-server-ctx'
import { SpaceServerEvt } from 'gamezilla-app/app/spaces/@/space-server-evt'
import { GameServerModule } from 'gamezilla-app/app/spaces/games/@/architecture/game-server-v2'
import * as ConnectFour from '../@/connect-four/connect-four'
import {
  type ModelCore,
  type ModelServer,
  type MsgCore,
  type MsgServer,
  type MsgToClient,
  type MsgToServer,
  isBotTurn
} from './vs-bot.types'

//
//
//
//
//
//
//

type Module = GameServerModule<{
  Model: ModelServer
  Msg: MsgServer
  MsgToClient: MsgToClient
  MsgToServer: MsgToServer
  ModelCore: ModelCore
  MsgCore: MsgCore
  Ctx: SpaceServerCtx
  Deps: null
  MsgCmdIn: null
  MsgEvtIn: SpaceServerEvt
  MsgCmdOut: SpaceServerCmd<MsgToClient>
  MsgEvtOut: null
}>

export const init: Module['init'] = {
  botStartedFindingMoveAt: null
}

export const update: Module['update'] = async (input) => {
  return GameServerModule.andThen({}, () => updateFromMsg(input))
}

const updateFromMsg: Module['update'] = async (input) => {
  const { msg, modelCore } = input

  if (!msg) {
    return {}
  }

  switch (msg.t) {
    case 'time-passed': {
      const shouldBotMove = isBotTurn(modelCore)
      if (modelCore.type === 'game' && shouldBotMove && msg.t === 'time-passed') {
        return {}
      }

      return {}
    }

    case 'bot-found-best-move': {
      if (isErr(msg.found)) {
        return {}
      }

      const columnIndex = msg.found.value.columnIndex

      if (!ConnectFour.isColumnIndex(columnIndex)) {
        return {}
      }

      const msgCoreNew = withEventId<MsgCore>({
        t: 'bot-dropped-disc',
        columnIndex
      })

      return {
        msgCore: [msgCoreNew]
      }
    }
  }
}

export const subscriptions: Module['subscriptions'] = async (input) => {
  if (isBotTurn(input.modelCore)) {
    return Time.interval('vs-bot', TimeSpan.seconds(1 / 2), () => ({
      t: 'time-passed'
    }))
  }
  return Sub.None
}
