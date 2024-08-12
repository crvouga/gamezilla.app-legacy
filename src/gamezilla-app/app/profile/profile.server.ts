import { type Profile, ProfileAvatar, type UserId, Username } from 'gamezilla-app/app/@/data'
import { type ServerCmd, type ServerCtx, type ServerEvt, sendToClient } from 'gamezilla-app/app/@/server'
import { Err, Ok, Result, isErr } from 'gamezilla-app/@/core'
import type { AppServerModule } from '../@/architecture/app-server'
import type { ProfileDb } from './profile-db/profile-db'
import { createProfileDb } from './profile-db/profile-db-impl.postgres'
import {
  type MsgServer,
  type MsgToClient,
  type MsgToServer,
  type ProfileCore,
  type Req,
  profileCoreToProfile
} from './profile.types'

//
//
//
//
//
//

type Module = AppServerModule<{
  Ctx: ServerCtx
  MsgCmdIn: null
  MsgEvtIn: ServerEvt
  Model: null
  Msg: MsgServer
  MsgCmdOut: ServerCmd<MsgToClient>
  MsgEvtOut: null
  MsgToClient: MsgToClient
  MsgToServer: MsgToServer
  Deps: Deps
}>
//
//
//
//
//
//

export type Deps = {}

export const getDeps: Module['getDeps'] = async () => {
  return {}
}

//
//
//
// model
//
//
//

export const init: Module['init'] = async () => {
  return {}
}

//
//
//
// update
//
//
//

export const update: Module['update'] = async (input) => {
  if (input.msg) {
    return updateFromMsg(input)
  }

  if (input.msgClient) {
    return updateFromClient(input)
  }

  if (input.msgEvt) {
    return updateFromEvent(input)
  }

  return {}
}

const updateFromMsg: Module['update'] = async ({ msg }) => {
  if (!msg) {
    return {}
  }

  switch (msg.t) {
    case 'profile.update-username.noop': {
      return {}
    }
    case 'handled': {
      return {
        msgCmd: [sendToClient([msg.clientId], msg.msg)]
      }
    }
  }
}

const updateFromClient: Module['update'] = async ({ msgClient, ctx }) => {
  if (!msgClient) {
    return {}
  }

  if (msgClient.t === 'profile.update-username.clicked-save') {
    return {}
  }

  const userId = msgClient.userId

  if (!userId) {
    return {}
  }

  const ProfileDb = createProfileDb({
    dbConn: ctx.dbConnSql
  })

  const result = await handler({
    ProfileDb,
    msg: msgClient,
    ctx: {
      ...ctx,
      currentUserId: userId
    }
  })

  return {
    msgCmd: [
      sendToClient([msgClient.clientId], {
        ...msgClient,
        result
      })
    ]
  }
}

const updateFromEvent: Module['update'] = async ({ msgEvt, ctx }) => {
  if (!msgEvt) {
    return {}
  }

  switch (msgEvt.t) {
    case 'auth/client-authenticated': {
      const ProfileDb = createProfileDb({ dbConn: ctx.dbConnSql })
      const result = await findElseInsertNew({
        ProfileDb,
        userId: msgEvt.account.userId
      })
      return {
        msgCmd: [
          sendToClient([msgEvt.clientId], {
            t: 'current-user-profile',
            result: Result.mapOk(result, profileCoreToProfile),
            causedBy: { msgEvt },
            loggedIn: msgEvt.loggedIn
          })
        ]
      }
    }

    default: {
      return {}
    }
  }
}

const handler = async ({
  ProfileDb,
  msg
}: {
  ProfileDb: ProfileDb
  msg: Req
  ctx: { currentUserId: UserId }
}): Promise<Result<string, Profile[]>> => {
  switch (msg.t) {
    case 'find-one': {
      const found = await ProfileDb.findOneByUserId(msg.userId)
      return Result.mapOk(found, (profiles) => profiles.map(profileCoreToProfile))
    }

    case 'change-username': {
      return Err('not implemented')
    }

    case 'delete-forever': {
      return Err('not implemented')
    }

    case 'search': {
      return Err('not implemented')
    }
  }
}

const findElseInsertNew = async ({ ProfileDb, userId }: { ProfileDb: ProfileDb; userId: UserId }) => {
  const found = await ProfileDb.findOneByUserId(userId)

  if (isErr(found)) {
    return found
  }

  const profile = found.value[0]

  if (profile) {
    return Ok(profile)
  }

  const randomSeed = ProfileAvatar.generateRandomSeed()
  const randomUsername = await Username.generate('.')
  const profileNew: ProfileCore = {
    userId,
    username: randomUsername,
    avatarSeed: randomSeed,
    avatarStyle: 'thumbs'
  }

  const inserted = await ProfileDb.insertOne(profileNew)

  if (isErr(inserted)) {
    return inserted
  }

  return Ok(profileNew)
}
