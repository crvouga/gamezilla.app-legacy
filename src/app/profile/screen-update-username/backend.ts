import { BackendCmd } from '~/app/@/backend/cmd'
import { IUserProfileDb } from '../@/user-profile/user-profile-db/interface'
import { MsgBackend, MsgToFrontend, MsgToBackend } from './types'

export const update = async (input: {
  deps: {
    profileDb: IUserProfileDb
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
