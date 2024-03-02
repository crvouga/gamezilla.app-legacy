import {
  ClientEvent,
  RouteChat,
  ClientCtx,
} from "gamezilla/@CHILD/app/@SHARED/client"

import { Browser, Eff, exhaustive, p } from "gamezilla/@SHARED/core"
import { ModelClient, MsgClient, MsgToClient } from "./chat.core"
import { VDom } from "gamezilla/@SHARED/vdom"

//
//
//
// Model
//
//
//

export const init = ({
  stored,
}: {
  stored: ModelClient | null
}): { model: ModelClient } => {
  if (stored) {
    return {
      model: stored,
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
      userSearch: "",
      userSelected: {},
    },
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

const userSearchInputId = "user-search-input"

export const update = ({
  msg,
  model,
}: {
  msg: Msg
  model: ModelClient
}): { model: ModelClient; eff?: Eff<Msg> } => {
  switch (msg[0]) {
    case "clicked-user-search-result": {
      return {
        model: {
          ...model,
          userSelected: toggleKey(model.userSelected, msg[1].userId),
          userSearch: "",
        },
      }
    }

    case "clicked-user-selected-delete-button": {
      return {
        model: {
          ...model,
          userSelected: removeKey(model.userSelected, msg[1].userId),
        },
      }
    }

    case "inputted-user-search": {
      return {
        model: {
          ...model,
          userSearch: msg[1].userSearch,
        },
      }
    }

    case "clicked-user-search-clear-button": {
      return {
        model: {
          ...model,
          userSelected: {},
          userSearch: "",
        },
        eff: p(
          Browser.focus(userSearchInputId),
          Eff.perform((result) => ["focused", result]),
        ),
      }
    }

    default: {
      return {
        model,
        eff: Eff.None,
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
  model,
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
  model,
}: {
  msg: ClientEvent
  model: ModelClient
}): {
  model: ModelClient
  eff?: Eff<Msg>
} => {
  switch (msg.t) {
    case "routing/route-changed": {
      if (msg.route.t !== "chat") {
        return { model }
      }

      switch (msg.route.c.t) {
        case "chat-conversation": {
          return {
            model,
          }
        }

        case "chat-new": {
          return {
            model,
          }
        }

        default: {
          return {
            model,
          }
        }
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
// View
//
//
//

export const View = ({
  model,
  dispatch,
  ctx,
  route,
  userSearch,
  viewBottomBar,
}: {
  model: ModelClient
  dispatch: (m: Msg) => void
  ctx: ClientCtx
  route: RouteChat
  userSearch: {
    onInput: (searchText: string) => void
    loading: boolean
  }
  viewBottomBar: VDom
}) => {
  switch (route.t) {
    case "chat-conversation": {
      return <ViewChat model={model} dispatch={dispatch} />
    }

    case "chat-new": {
      return (
        <ViewChatNew
          model={model}
          dispatch={dispatch}
          ctx={ctx}
          userSearch={userSearch}
        />
      )
    }

    case "chat": {
      return (
        <>
          <ViewChatList model={model} dispatch={dispatch} ctx={ctx} />
          {viewBottomBar}
        </>
      )
    }

    default: {
      return exhaustive(route)
    }
  }
}

const ViewChat = (_props: {
  model: ModelClient
  dispatch: (m: Msg) => void
}) => {
  return <div>ViewChat</div>
}

const ViewChatNew = (_props: {
  ctx: ClientCtx
  model: ModelClient
  dispatch: (m: Msg) => void
  userSearch: {
    onInput: (searchText: string) => void
    loading: boolean
  }
}) => {
  return <div></div>
}

const ViewChatList = (_props: {
  ctx: ClientCtx
  model: ModelClient
  dispatch: (m: Msg) => void
}) => {
  return <div></div>
}
