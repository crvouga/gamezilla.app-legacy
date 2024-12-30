import type { AppClientCtx, ClientEvt } from '~/app/@/client'
import { Eff } from '~/@/program/eff'
import type { VDom } from '~/@/vdom'
import type { ModelClient, MsgClient, MsgToClient } from './chat.core'
import { pipe } from '~/@/function/pipe'
import { Browser } from '~/@/browser'

//
//
//
// Model
//
//
//

export const init = ({ stored }: { stored: ModelClient | null }): { model: ModelClient } => {
  if (stored) {
    return {
      model: stored
    }
  }

  return {
    model: {
      chats: {},
      chatsUsers: {},
      users: {},
      messageDrafts: {},
      messages: {},
      requests: {},
      userSearch: '',
      userSelected: {}
    }
  }
}

//
//
//
// Msg
//
//
//

export type Msg = MsgClient

//
//
//
// Update
//
//
//

const userSearchInputId = 'user-search-input'

export const update = ({ msg, model }: { msg: Msg; model: ModelClient }): { model: ModelClient; eff?: Eff<Msg> } => {
  switch (msg[0]) {
    case 'clicked-user-search-result': {
      return {
        model: {
          ...model,
          userSelected: toggleKey(model.userSelected, msg[1].userId),
          userSearch: ''
        }
      }
    }

    case 'clicked-user-selected-delete-button': {
      return {
        model: {
          ...model,
          userSelected: removeKey(model.userSelected, msg[1].userId)
        }
      }
    }

    case 'inputted-user-search': {
      return {
        model: {
          ...model,
          userSearch: msg[1].userSearch
        }
      }
    }

    case 'clicked-user-search-clear-button': {
      return {
        model: {
          ...model,
          userSelected: {},
          userSearch: ''
        },
        eff: pipe(
          Browser.focus(userSearchInputId),
          Eff.perform((result) => ['focused', result])
        )
      }
    }

    default: {
      return {
        model,
        eff: Eff.None
      }
    }
  }
}

const toggleKey = <T extends object>(obj: T, key: keyof T) => {
  const newObj: T = { ...obj }
  if (key in newObj) {
    delete newObj[key]
  } else {
    newObj[key] = key as T[keyof T]
  }
  return newObj
}
const removeKey = <T extends object>(obj: T, key: keyof T) => {
  const newObj: T = { ...obj }
  if (key in newObj) {
    delete newObj[key]
  }
  return newObj
}

export const updateFromServer = ({
  model
}: {
  msg: MsgToClient
  model: ModelClient
}): {
  model: ModelClient
  eff?: Eff<Msg>
} => {
  return { model }
}

export const updateFromEvent = ({
  msg,
  model
}: {
  msg: ClientEvt
  model: ModelClient
}): {
  model: ModelClient
  eff?: Eff<Msg>
} => {
  switch (msg.t) {
    default: {
      return {
        model
      }
    }
  }
}

//
//
//
// View
//
//
//

export const View = (_input: {
  model: ModelClient
  dispatch: (m: Msg) => void
  ctx: AppClientCtx
  userSearch: {
    onInput: (searchText: string) => void
    loading: boolean
  }
  viewBottomBar: VDom
}) => {
  return null
}

export const ViewChat = (_input: { model: ModelClient; dispatch: (m: Msg) => void }) => {
  return <div>ViewChat</div>
}

export const ViewChatNew = (_input: {
  ctx: AppClientCtx
  model: ModelClient
  dispatch: (m: Msg) => void
  userSearch: {
    onInput: (searchText: string) => void
    loading: boolean
  }
}) => {
  return <div>ViewChat</div>
}

export const ViewChatList = (_input: { ctx: AppClientCtx; model: ModelClient; dispatch: (m: Msg) => void }) => {
  return <div>View </div>
}
