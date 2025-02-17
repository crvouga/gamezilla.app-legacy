import { Err, Ok, Result, isErr } from '~/@/result'
import { AppBackendModule } from '../@/architecture/app-backend'
import { Profile } from '../@/data/profile'
import { ProfileAvatar } from '../@/data/profile-avatar'
import { UserId } from '../@/data/user-id'
import { Username } from '../@/data/username'
import { sendToFrontend } from '../@/backend/cmd'
import { AppBackendCtx } from '../@/backend/ctx'
import { type IProfileDb, ProfileDb } from './profile-db'
import { type ProfileCore, type Req, BackendCtx, BackendModule, profileCoreToProfile } from './types'

//
//
//
//
//
//

export const initCtx = async (input: { ctx: AppBackendCtx }): Promise<BackendCtx> => {
  return {
    ...input.ctx,
  }
}

export const update: BackendModule['update'] = async (input) => {
  return AppBackendModule.andThen(
    {},
    () => updateFromMsg(input),
    () => updateFromFrontend(input),
    () => updateFromEvent(input),
  )
}

const updateFromMsg: BackendModule['update'] = async ({ msg }) => {
  if (!msg) return {}

  switch (msg.t) {
    case 'got-update-username-msg': {
      return {}
    }
    case 'handled': {
      return { msgCmd: [sendToFrontend([msg.clientId], msg.msg)] }
    }
  }
}

const updateFromFrontend: BackendModule['update'] = async ({ msgFrontend, ctx }) => {
  if (!msgFrontend) return {}

  switch (msgFrontend.t) {
    case 'got-update-username-msg': {
      return {}
    }
    default: {
      const userId = msgFrontend.userId
      if (!userId) return {}
      const profileDb = ProfileDb({ t: 'db-conn-sql', dbConnSql: ctx.dbConnSql, logger: ctx.logger })

      const result = await handler({
        profileDb,
        msg: msgFrontend,
        ctx: {
          ...ctx,
          currentUserId: userId,
        },
      })

      return {
        msgCmd: [
          sendToFrontend([msgFrontend.clientId], {
            ...msgFrontend,
            result,
          }),
        ],
      }
    }
  }
}

const updateFromEvent: BackendModule['update'] = async ({ msgEvt, ctx }) => {
  if (!msgEvt) return {}

  switch (msgEvt.t) {
    case 'auth-evt.client-authenticated': {
      const profileDb = ProfileDb({ t: 'db-conn-sql', dbConnSql: ctx.dbConnSql, logger: ctx.logger })
      const result = await findElseInsertNew({
        profileDb,
        userId: msgEvt.user.userId,
      })
      return {
        msgCmd: [
          sendToFrontend([msgEvt.clientId], {
            t: 'current-user-profile',
            result: Result.mapOk(result, profileCoreToProfile),
            causedBy: { msgEvt },
            loggedIn: msgEvt.loggedIn,
          }),
        ],
      }
    }

    default: {
      return {}
    }
  }
}

const handler = async ({
  profileDb,
  msg,
}: {
  profileDb: IProfileDb
  msg: Req
  ctx: { currentUserId: UserId }
}): Promise<Result<string, Profile[]>> => {
  switch (msg.t) {
    case 'find-one': {
      const found = await profileDb.findByUserId(msg.userId)
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

const findElseInsertNew = async ({ profileDb, userId }: { profileDb: IProfileDb; userId: UserId }) => {
  const found = await profileDb.findByUserId(userId)

  if (isErr(found)) return found

  const profile = found.value[0]

  if (profile) return Ok(profile)

  const randomSeed = ProfileAvatar.randomSeed()
  const randomUsername = await Username.generate('.')
  const profileNew: ProfileCore = {
    userId,
    username: randomUsername,
    avatarSeed: randomSeed,
    avatarStyle: 'thumbs',
  }

  const inserted = await profileDb.put(profileNew)

  if (isErr(inserted)) return inserted

  return Ok(profileNew)
}
