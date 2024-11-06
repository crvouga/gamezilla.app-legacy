import type { ClientId, SessionId, UserId } from './@/data'
import { ServerEvt } from './@/server'
import type { Platform, Routing, Sound, StatusBar, Toast } from './app-client'
import { AuthTypes } from './auth'
import { LangTypes } from './lang'
import { ProfileTypes } from './profile'
import { ServerInstanceTypes } from './server-instance'
import { SpacesTypes } from './spaces'
import { WireTypes } from './wire'

//
//
//
//
//
//
//

export type ModelClient = {
  auth: AuthTypes.ModelClient
  spaces: SpacesTypes.ModelClient
  profile: ProfileTypes.ModelClient
  wire: WireTypes.ModelClient
  lang: LangTypes.ModelClient
  routing: Routing.Model
  toast: Toast.Model
  sound: Sound.Model
  platform: Platform.Model
  statusBar: StatusBar.Model
  serverInstance: ServerInstanceTypes.ModelClient
}

//
//
//
//
//
//
//

export type MsgServer =
  | ({ t: '→'; c: MsgToServer } & MsgToServerMeta)
  | { t: 'got-server-evt'; c: ServerEvt }
  | { t: 'wire'; c: WireTypes.MsgServer }
  | { t: 'spaces'; c: SpacesTypes.MsgServer }
  | { t: 'profile'; c: ProfileTypes.MsgServer }
  | { t: 'auth'; c: AuthTypes.MsgServer }
  | { t: 'lang'; c: LangTypes.MsgServer }
  | { t: 'server-instance'; c: ServerInstanceTypes.MsgServer }

export type MsgClient =
  | { t: '→'; c: MsgToClient }
  | { t: 'routing'; c: Routing.Msg }
  | { t: 'toast'; c: Toast.Msg }
  | { t: 'sound'; c: Sound.Msg }
  | { t: 'platform'; c: Platform.Msg }
  | { t: 'status-bar'; c: StatusBar.Msg }
  | { t: 'wire'; c: WireTypes.MsgClient }
  | { t: 'spaces'; c: SpacesTypes.MsgClient }
  | { t: 'auth'; c: AuthTypes.MsgClient }
  | { t: 'profile'; c: ProfileTypes.MsgClient }
  | { t: 'lang'; c: LangTypes.MsgClient }
  | { t: 'server-instance'; c: ServerInstanceTypes.MsgClient }

export type MsgToServer =
  | { t: 'spaces'; c: SpacesTypes.MsgToServer }
  | { t: 'auth'; c: AuthTypes.MsgToServer }
  | { t: 'profile'; c: ProfileTypes.MsgToServer }
  | { t: 'wire'; c: WireTypes.MsgToServer }
  | { t: 'lang'; c: LangTypes.MsgToServer }
  | { t: 'server-instance'; c: ServerInstanceTypes.MsgToServer }

export type MsgToClient =
  | { t: 'spaces'; c: SpacesTypes.MsgToClient }
  | { t: 'auth'; c: AuthTypes.MsgToClient }
  | { t: 'profile'; c: ProfileTypes.MsgToClient }
  | { t: 'wire'; c: WireTypes.MsgToClient }
  | { t: 'lang'; c: LangTypes.MsgToClient }
  | { t: 'server-instance'; c: ServerInstanceTypes.MsgToClient }

//
//
//

export type MsgToServerMeta = {
  sessionId: SessionId
  clientId: ClientId
  userId?: UserId | null
}
