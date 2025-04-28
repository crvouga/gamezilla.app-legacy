import { Sub } from '~/@/sub'
import { addProfiles } from '~/app/@/frontend/cmd'
import { ProfileFrontendCtx } from '../frontend/ctx'
import { ProfileDbQuery } from '../user-profile/user-profile-db/query'
import type { FrontendModule, MsgFrontend, MsgInCmdFrontend } from './types'

const update: FrontendModule['update'] = (input) => {
  switch (input.msgCmd?.c.t) {
    case 'got-msg': {
      return update({
        ...input,
        msgCmd: null,
        msg: input.msgCmd.c.msg,
      })
    }
  }

  switch (input.msg?.t) {
    case 'got-profile-db-profiles': {
      return {
        model: {
          ...input.model,
          results: {
            ...input.model.results,
            [ProfileDbQuery.toKey(input.msg.query)]: input.msg.profiles.map((p) => p.id),
          },
        },
        msgCmd: [addProfiles(input.msg.profiles)],
      }
    }
  }

  return { model: input.model }
}

const gotMsg = (msg: MsgFrontend): MsgInCmdFrontend => {
  return {
    t: 'profile-cmd.got-profile-loader-cmd',
    c: {
      t: 'got-msg',
      msg,
    },
  }
}

const watch = <TMsg,>(
  ctx: ProfileFrontendCtx,
  query: ProfileDbQuery | null,
  map: (m: MsgFrontend) => TMsg,
): Sub<TMsg> => {
  if (!query) {
    return Sub.None
  }
  return Sub.map(ctx.profileDb.sub(query), (profiles) => map({ t: 'got-profile-db-profiles', query, profiles }))
}

export const ProfileLoaderFrontend = {
  update,
  watch,
  gotMsg,
}
