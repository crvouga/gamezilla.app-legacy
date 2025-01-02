import { Err, Ok, Result, isErr } from '~/@/result'
import { AppServerModule } from '../@/architecture/app-server'
import { Profile } from '../@/data/profile'
import { ProfileAvatar } from '../@/data/profile-avatar'
import { UserId } from '../@/data/user-id'
import { Username } from '../@/data/username'
import { sendToClient } from '../@/server/server-cmd'
import { AppServerCtx } from '../@/server/server-ctx'
import type { ProfileDb } from './profile-db/profile-db'
import { createProfileDb } from './profile-db/profile-db-impl.postgres'
import { type ProfileCore, type Req, ServerCtx, ServerModule, profileCoreToProfile } from './types'

//
//
//
//
//
//

export const initCtx = async (input: { ctx: AppServerCtx }): Promise<ServerCtx> => {
  return {
    ...input.ctx
  }
}

export const update: ServerModule['update'] = async (input) => {
  return AppServerModule.andThen(
    {},
    () => updateFromMsg(input),
    () => updateFromClient(input),
    () => updateFromEvent(input)
  )
}

const updateFromMsg: ServerModule['update'] = async ({ msg }) => {
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

const updateFromClient: ServerModule['update'] = async ({ msgClient, ctx }) => {
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

const updateFromEvent: ServerModule['update'] = async ({ msgEvt, ctx }) => {
  if (!msgEvt) {
    return {}
  }

  switch (msgEvt.t) {
    case 'auth-evt.client-authenticated': {
      const ProfileDb = createProfileDb({ dbConn: ctx.dbConnSql })
      const result = await findElseInsertNew({
        ProfileDb,
        userId: msgEvt.user.userId
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
