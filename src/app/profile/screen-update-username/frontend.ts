import { isAnyMsg } from '~/@/msg/msg'
import { RequestResponse } from '~/@/request-response/request-response'
import { TextField } from '~/@/ui/text-field'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { sx } from '~/@/vdom/style/sx'
import { AppFrontendCtxBase } from '~/app/@/frontend/ctx'
import { PushScreenCmd } from '~/app/@/frontend/push-screen-cmd.$msg'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'

export type Model = {
  profiles_updateUsername_clickedSave?: string
  profiles_updateUsername_request?: RequestResponse<string, null>
}

const init = (input: {
  ctx: AppFrontendCtxBase
}): {
  model: Model
} => {
  return {
    model: {
      profiles_updateUsername_clickedSave: input.ctx.currentUser?.userId
        ? (input.ctx.profilesByUserId[input.ctx.currentUser?.userId]?.username ?? '')
        : '',
    },
  }
}

export type Msg =
  | {
      t: 'profiles_updateUsername_inputtedUsername'
      username: string
    }
  | {
      t: 'profiles_updateUsername_clickedBack'
    }
  | {
      t: 'profiles_updateUsername_clickedSave'
    }

const isMsg = (msg: unknown): msg is Msg => {
  return isAnyMsg(msg) && msg.t.startsWith('profiles_updateUsername_')
}

const update = <T extends Model>(input: {
  ctx: AppFrontendCtxBase
  model: T
  msg?: unknown
}): {
  model: T
  msgOut?: unknown[]
} => {
  if (!isMsg(input.msg)) return { model: input.model }
  switch (input.msg?.t) {
    case 'profiles_updateUsername_clickedBack': {
      return {
        model: input.model,
        msgOut: [PushScreenCmd.init({ t: 'profile-edit', n: 'profile' })],
      }
    }

    case 'profiles_updateUsername_clickedSave': {
      return {
        model: {
          ...input.model,
          profiles_updateUsername_request: RequestResponse.startedRequest(input.ctx.now),
        },
      }
    }

    case 'profiles_updateUsername_inputtedUsername': {
      return {
        model: {
          ...input.model,
          profiles_updateUsername_clickedSave: input.msg.username,
        },
      }
    }
  }
}

const View = (input: { ctx: AppFrontendCtxBase; model: Model; dispatch: (msg: Msg) => void }) => {
  return h(ScreenLayout, {
    parentScreen: input.ctx.parentScreen,
    id: 'profile-update-username',
    ctx: input.ctx,
    navBar: {
      title: input.ctx.t('profile.update-username.update-username'),
      back: {
        onPress: () => input.dispatch({ t: 'profiles_updateUsername_clickedBack' }),
      },
    },
    actionEdit: {
      onSubmit: () => input.dispatch({ t: 'profiles_updateUsername_clickedSave' }),
      submitText: input.ctx.t('app.save'),
      cancelText: input.ctx.t('app.cancel'),
      onCancel: () => input.dispatch({ t: 'profiles_updateUsername_clickedBack' }),
      submitLoading: input.model['profiles_updateUsername_request']?.t === 'loading',
      submitDisabled: false,
      cancelDisabled: false,
    },
    renderBody: () =>
      h(Box, { style: sx({ flexDirection: 'col', width: 'full', gap: 4, padding: 4 }) }, [
        h(TextField, {
          id: 'username',
          label: input.ctx.t('username.username-label'),
          value: input.model['profiles_updateUsername_clickedSave'] ?? '',
          onChangeText: (username) => input.dispatch({ t: 'profiles_updateUsername_inputtedUsername', username }),
        }),
      ]),
  })
}

export const ScreenUpdateUsernameFrontend = {
  init,
  update,
  View,
}
