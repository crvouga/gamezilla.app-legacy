import { AppFrontendCmd, FrontendCmdTypes } from '~/app/@/frontend/cmd'
import { ProfileLoaderTypes } from '../user-profile-loader'

export type ProfileFrontendCmdBase = ProfileLoaderTypes.MsgInCmdFrontend

export type ProfileFrontendCmd<T extends FrontendCmdTypes> = ProfileFrontendCmdBase | AppFrontendCmd<T>

const toAppFrontendCmd = <T extends FrontendCmdTypes>(
  cmd: ProfileFrontendCmd<T> | null | undefined,
): AppFrontendCmd<T>[] => {
  switch (cmd?.t) {
    case 'profile-cmd.got-profile-loader-cmd': {
      return []
    }
    default: {
      return cmd ? [cmd] : []
    }
  }
}

const toProfileFrontendCmdBase = <T extends FrontendCmdTypes>(
  cmd: ProfileFrontendCmd<T> | null | undefined,
): ProfileFrontendCmdBase[] => {
  switch (cmd?.t) {
    case 'profile-cmd.got-profile-loader-cmd': {
      return [cmd]
    }
    default: {
      return []
    }
  }
}

export const ProfileFrontendCmd = {
  ...AppFrontendCmd,
  toAppFrontendCmd,
  toProfileFrontendCmdBase,
}
