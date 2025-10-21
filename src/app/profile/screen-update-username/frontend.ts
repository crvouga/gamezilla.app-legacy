import { Eff } from '~/@/eff'
import { RequestResponse } from '~/@/request-response/request-response'
import { Sub } from '~/@/sub'
import { TextField } from '~/@/ui/text-field'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { sx } from '~/@/vdom/style/sx'
import { AppFrontendCtxBase } from '~/app/@/frontend/ctx'
import { pushScreen } from '~/app/@/frontend/push-screen-cmd.$msg'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'

export type Model = {
  clickedSave?: string
  request?: RequestResponse<string, null>
}

const init = (input: {
  ctx: AppFrontendCtxBase
}): {
  model: Model
  eff?: Eff<Msg>
} => {
  return {
    model: {
      clickedSave: input.ctx.currentUser?.userId
        ? (input.ctx.profilesByUserId[input.ctx.currentUser?.userId]?.username ?? '')
        : '',
    },
    eff: Eff.None,
  }
}

export type Msg =
  | {
      t: 'inputtedUsername'
      username: string
    }
  | {
      t: 'clickedBack'
    }
  | {
      t: 'clickedSave'
    }

const update = (input: {
  ctx: AppFrontendCtxBase
  model: Model
  msg: Msg
}): {
  model: Model
  eff?: Eff<Msg>
} => {
  switch (input.msg.t) {
    case 'clickedBack': {
      return {
        model: input.model,
        eff: pushScreen({ n: 'profile', t: 'profile_profileEdit' }),
      }
    }

    case 'clickedSave': {
      return {
        model: {
          ...input.model,
          request: RequestResponse.startedRequest(input.ctx.now),
        },
      }
    }

    case 'inputtedUsername': {
      return {
        model: {
          ...input.model,
          clickedSave: input.msg.username,
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
        onPress: () => input.dispatch({ t: 'clickedBack' }),
      },
    },
    actionEdit: {
      onSubmit: () => input.dispatch({ t: 'clickedSave' }),
      submitText: input.ctx.t('app.save'),
      cancelText: input.ctx.t('app.cancel'),
      onCancel: () => input.dispatch({ t: 'clickedBack' }),
      submitLoading: input.model['request']?.t === 'loading',
      submitDisabled: false,
      cancelDisabled: false,
    },
    renderBody: () =>
      h(Box, { style: sx({ flexDirection: 'col', width: 'full', gap: 4, padding: 4 }) }, [
        h(TextField, {
          id: 'username',
          label: input.ctx.t('username.username-label'),
          value: input.model['clickedSave'] ?? '',
          onChangeText: (username) => input.dispatch({ t: 'inputtedUsername', username }),
        }),
      ]),
  })
}

const subscriptions = (_input: { ctx: AppFrontendCtxBase; model: Model }): Sub<Msg> => {
  return Sub.none()
}

export const ScreenUpdateUsernameFrontend = {
  init,
  update,
  View,
  subscriptions,
}
