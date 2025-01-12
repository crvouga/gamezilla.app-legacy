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
  type ModelSpace,
  type ModelBackend,
  type MsgSpace,
  type MsgBackend,
  type MsgToFrontend,
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
  MsgToFrontend: MsgToFrontend
  MsgToBackend: MsgToBackend
  ModelSpace: ModelSpace
  MsgSpace: MsgSpace
  Ctx: SpaceBackendCtx
  Deps: null
  MsgCmdIn: null
  MsgEvtIn: SpaceBackendEvt
  MsgCmdOut: SpaceBackendCmd<MsgToFrontend>
  MsgEvtOut: null
}>

export const init: Module['init'] = {
  botStartedFindingMoveAt: null,
}

export const update: Module['update'] = async (input) => {
  return GameBackendModule.andThen({}, () => updateFromMsg(input))
}

const updateFromMsg: Module['update'] = async (input) => {
  const { msg, modelSpace } = input

  if (!msg) {
    return {}
  }

  switch (msg.t) {
    case 'time-passed': {
      const shouldBotMove = isBotTurn(modelSpace)
      if (modelSpace.type === 'game' && shouldBotMove && msg.t === 'time-passed') {
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

      const msgSpaceNew = withEventId<MsgSpace>({
        t: 'bot-dropped-disc',
        columnIndex,
      })

      return {
        msgSpace: [msgSpaceNew],
      }
    }
  }
}

export const subscriptions: Module['subscriptions'] = async (input) => {
  if (isBotTurn(input.modelSpace)) {
    return Time.interval('vs-bot', TimeSpan.seconds(1 / 2), () => ({
      t: 'time-passed',
    }))
  }
  return Sub.None
}
