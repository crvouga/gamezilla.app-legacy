import { Eff } from '~/@/eff'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { Text } from '~/@/vdom/primitives/text'
import type { VDom } from '~/@/vdom/vdom'
import { AppFrontendCtx } from '../@/frontend/ctx'
import type { ModelFrontend, MsgFrontend, MsgToFrontend } from './types'

//
//
//
// Model
//
//
//

export const init = ({ stored }: { stored: ModelFrontend | null }): { model: ModelFrontend } => {
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
      userSearch: '',
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

export type Msg = MsgFrontend

//
//
//
// Update
//
//
//

export const update = ({
  msg,
  model,
}: {
  msg: Msg
  model: ModelFrontend
}): { model: ModelFrontend; eff?: Eff<Msg> } => {
  switch (msg[0]) {
    case 'clicked-user-search-result': {
      return {
        model: {
          ...model,
          userSelected: toggleKey(model.userSelected, msg[1].userId),
          userSearch: '',
        },
      }
    }

    case 'clicked-user-selected-delete-button': {
      return {
        model: {
          ...model,
          userSelected: removeKey(model.userSelected, msg[1].userId),
        },
      }
    }

    case 'inputted-user-search': {
      return {
        model: {
          ...model,
          userSearch: msg[1].userSearch,
        },
      }
    }

    case 'clicked-user-search-clear-button': {
      return {
        model: {
          ...model,
          userSelected: {},
          userSearch: '',
        },
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

export const updateFromBackend = ({
  model,
}: {
  msg: MsgToFrontend
  model: ModelFrontend
}): {
  model: ModelFrontend
  eff?: Eff<Msg>
} => {
  return { model }
}

//
//
//
// View
//
//
//

export const View = (_input: {
  model: ModelFrontend
  dispatch: (m: Msg) => void
  ctx: AppFrontendCtx
  userSearch: {
    onInput: (searchText: string) => void
    loading: boolean
  }
  viewBottomBar: VDom
}) => {
  return null
}

export const ViewChat = (_input: { model: ModelFrontend; dispatch: (m: Msg) => void }) => {
  return h(Box, {}, [Text({ text: 'ViewChat' })])
}

export const ViewChatNew = (_input: {
  ctx: AppFrontendCtx
  model: ModelFrontend
  dispatch: (m: Msg) => void
  userSearch: {
    onInput: (searchText: string) => void
    loading: boolean
  }
}) => {
  return h(Box, {}, [Text({ text: 'ViewChat' })])
}

export const ViewChatList = (_input: { ctx: AppFrontendCtx; model: ModelFrontend; dispatch: (m: Msg) => void }) => {
  return h(Box, {}, [Text({ text: 'ViewChatList' })])
}
