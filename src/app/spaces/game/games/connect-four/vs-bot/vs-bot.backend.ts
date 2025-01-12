import { isErr } from '~/@/result'
import { withEventId } from '~/@/event-sourced/event'
import { Time } from '~/@/time/time'
import { TimeSpan } from '~/@/time/time-span'
import type { SpaceBackendCmd } from '~/app/spaces/@/space-backend/cmd'
import { SpaceBackendCtx } from '~/app/spaces/@/space-backend/ctx'
import { SpaceBackendEvt } from '~/app/spaces/@/space-backend/evt'
import { GameBackendModule } from '~/app/spaces/game/games/@/architecture/game-backend-v2'
import * as ConnectFour from '../@/connect-four/connect-four'
import {
  type ModelCore,
  type ModelBackend,
  type MsgCore,
  type MsgBackend,
  type MsgToClient,
  type MsgToBackend,
  isBotTurn,
} from './vs-bot.types'
import { Sub } from '~/@/sub'

//
//
//
//
//
//
//

type Module = GameBackendModule<{
  Model: ModelBackend
  Msg: MsgBackend
  MsgToClient: MsgToClient
  MsgToBackend: MsgToBackend
  ModelCore: ModelCore
  MsgCore: MsgCore
  Ctx: SpaceBackendCtx
  Deps: null
  MsgCmdIn: null
  MsgEvtIn: SpaceBackendEvt
  MsgCmdOut: SpaceBackendCmd<MsgToClient>
  MsgEvtOut: null
}>

export const init: Module['init'] = {
  botStartedFindingMoveAt: null,
}

export const update: Module['update'] = async (input) => {
  return GameBackendModule.andThen({}, () => updateFromMsg(input))
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
        columnIndex,
      })

      return {
        msgCore: [msgCoreNew],
      }
    }
  }
}

export const subscriptions: Module['subscriptions'] = async (input) => {
  if (isBotTurn(input.modelCore)) {
    return Time.interval('vs-bot', TimeSpan.seconds(1 / 2), () => ({
      t: 'time-passed',
    }))
  }
  return Sub.None
}
