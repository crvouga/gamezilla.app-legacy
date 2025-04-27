import { Browser } from '~/@/browser'
import { IDbConnSql } from '~/@/db-conn-sql'
import { IHttpServer } from '~/@/http-server'
import { LanguageCodeISO_639_1 } from '~/@/l18n'
import { ILogger } from '~/@/logger'
import { RPC } from '~/@/rpc'
import { Posix } from '~/@/time/posix'
import { AppBackendCtx } from './@/backend/ctx'
import { ClientId } from '../@/wire/client-id'
import { SessionId } from '../@/wire/session-id'
import { UserId } from './@/data/user-id'
import { AuthTypes } from './auth'
import * as FrontendTypes from './frontend/types'
import { LangTypes } from './lang'
import { ProfileTypes } from './profile'
import { SpacesTypes } from './spaces'
import { WireTypes } from './wire'
import { IBackendTransport } from './wire/transport/backend'
import { IFrontendTransport } from './wire/transport/frontend'
import { ClientSessionId } from '~/@/wire/client-session-id'

//
//
//
//
//
//
//

export type ModelFrontend = {
  frontend: FrontendTypes.ModelFrontend
  auth: AuthTypes.ModelFrontend
  spaces: SpacesTypes.ModelFrontend
  profile: ProfileTypes.ModelFrontend
  wire: WireTypes.ModelFrontend
  lang: LangTypes.ModelFrontend
}

//
//
//
//
//
//
//

export type MsgBackend =
  | ({ t: '→'; c: MsgToBackend } & MsgToBackendMeta)
  | { t: 'wire'; c: WireTypes.MsgBackend }
  | { t: 'spaces'; c: SpacesTypes.MsgBackend }
  | { t: 'profile'; c: ProfileTypes.MsgBackend }
  | { t: 'auth'; c: AuthTypes.MsgBackend }
  | { t: 'lang'; c: LangTypes.MsgBackend }
  | { t: 'frontend'; c: FrontendTypes.MsgBackend }

export type MsgFrontend =
  | { t: '→'; c: MsgToFrontend }
  | { t: 'wire'; c: WireTypes.MsgFrontend }
  | { t: 'spaces'; c: SpacesTypes.MsgFrontend }
  | { t: 'auth'; c: AuthTypes.MsgFrontend }
  | { t: 'profile'; c: ProfileTypes.MsgFrontend }
  | { t: 'lang'; c: LangTypes.MsgFrontend }
  | { t: 'frontend'; c: FrontendTypes.MsgFrontend }

export type MsgToBackend =
  | { t: 'spaces'; c: SpacesTypes.MsgToBackend }
  | { t: 'auth'; c: AuthTypes.MsgToBackend }
  | { t: 'profile'; c: ProfileTypes.MsgToBackend }
  | { t: 'wire'; c: WireTypes.MsgToBackend }
  | { t: 'lang'; c: LangTypes.MsgToBackend }
  | { t: 'frontend'; c: FrontendTypes.MsgToBackend }

export type MsgToFrontend =
  | { t: 'spaces'; c: SpacesTypes.MsgToFrontend }
  | { t: 'auth'; c: AuthTypes.MsgToFrontend }
  | { t: 'profile'; c: ProfileTypes.MsgToFrontend }
  | { t: 'wire'; c: WireTypes.MsgToFrontend }
  | { t: 'lang'; c: LangTypes.MsgToFrontend }
  | { t: 'frontend'; c: FrontendTypes.MsgToFrontend }
//
//
//

export type MsgToBackendMeta = {
  sessionId: SessionId
  clientId: ClientId
  clientSessionId: ClientSessionId
  userId?: UserId | null
}

//
//
//
//
//

export const rpcContract = RPC.initContract({
  wire: WireTypes.rpcContract,
  auth: AuthTypes.rpcContract,
})

//
//
//
//

export type BackendCtx = AppBackendCtx & {
  transport: IBackendTransport<{
    MsgToFrontend: MsgToFrontend
    MsgToBackend: MsgToBackend
  }>
  wire: WireTypes.BackendCtx<MsgToFrontend, MsgToBackend>
  profile: ProfileTypes.BackendCtx
  space: SpacesTypes.BackendCtx
  auth: AuthTypes.BackendCtx
  httpServer: IHttpServer
}

export type FrontendCtx = {
  dbConnSql: IDbConnSql
  logger: ILogger
  now: Posix
  rpc: RPC.Client<typeof rpcContract>
  location: Browser.Location
  clientSessionId: ClientSessionId
  navigatorLanguage: LanguageCodeISO_639_1
  transport: IFrontendTransport<{
    MsgToBackend: MsgToBackend
    MsgToFrontend: MsgToFrontend
  }>
  stored: Record<string, unknown>
}

//
//
//
//
