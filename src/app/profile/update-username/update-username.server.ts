import { ServerCmd } from '~/app/@/server/server-cmd'
import { ProfileDb } from '../profile-db/profile-db'
import { MsgServer, MsgToClient, MsgToServer } from './update-username.types'

export const update = async (input: {
  deps: {
    profileDb: ProfileDb
  }

  msg: MsgServer | null
  msgClient: MsgToServer | null
}): Promise<{
  msgCmd?: ServerCmd<MsgToClient>[]
}> => {
  switch (input.msgClient?.t) {
    case 'profile.update-username.clicked-save': {
      return {}
    }
  }
  return {}
}
