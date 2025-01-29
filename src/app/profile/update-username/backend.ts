import { BackendCmd } from '~/app/@/backend/cmd'
import { ProfileDb } from '../profile-db/profile-db'
import { MsgBackend, MsgToFrontend, MsgToBackend } from './types'

export const update = async (input: {
  deps: {
    profileDb: ProfileDb
  }

  msg: MsgBackend | null
  msgFrontend: MsgToBackend | null
}): Promise<{
  msgCmd?: BackendCmd<MsgToFrontend>[]
}> => {
  switch (input.msgFrontend?.t) {
    case 'profile.update-username.clicked-save': {
      return {}
    }
  }
  return {}
}
