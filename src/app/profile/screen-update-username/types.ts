import { RequestResponse } from '~/@/request-response/request-response'
import { AppFrontendModule } from '~/app/@/frontend/app-frontend-module'
import { AppFrontendCtxBase } from '~/app/@/frontend/ctx'

export type ModelFrontend = {
  'profile.update-username.username'?: string
  'profile-update-username.request'?: RequestResponse<string, null>
}

export type MsgFrontend =
  | {
      t: 'profile.update-username.inputted-username'
      username: string
    }
  | {
      t: 'profile.update-username.clicked-back'
    }
  | {
      t: 'profile.update-username.clicked-save'
    }

export type FrontendCtxModule = AppFrontendCtxBase

export type FrontendModule = AppFrontendModule<{
  Ctx: FrontendCtxModule
  Model: ModelFrontend
  Msg: MsgFrontend
}>
