import { BackendCmd } from '~/app/@/backend/cmd'
import { IProfileDb } from '../profile-db/interface'
import { MsgBackend, MsgToFrontend, MsgToBackend } from './types'

export const update = async (input: {
  deps: {
    profileDb: IProfileDb
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
