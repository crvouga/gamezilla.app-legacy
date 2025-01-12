import { BackendCmd } from '~/app/@/server/cmd'
import { ProfileDb } from '../profile-db/profile-db'
import { MsgBackend, MsgToClient, MsgToBackend } from './update-username.types'

export const update = async (input: {
  deps: {
    profileDb: ProfileDb
  }

  msg: MsgBackend | null
  msgClient: MsgToBackend | null
}): Promise<{
  msgCmd?: BackendCmd<MsgToClient>[]
}> => {
  switch (input.msgClient?.t) {
    case 'profile.update-username.clicked-save': {
      return {}
    }
  }
  return {}
}
