import { AppFrontendCmd, FrontendCmdTypes } from '~/app/@/frontend/cmd'
import { ProfileLoaderTypes } from '../user-profile-loader'

export type ProfileFrontendCmdInternal = ProfileLoaderTypes.MsgInCmdFrontend

export const isProfileFrontendCmdInternal = (cmd: ProfileFrontendCmd<any>): cmd is ProfileFrontendCmdInternal => {
  return cmd.t === 'profile-cmd.got-profile-loader-cmd'
}

export type ProfileFrontendCmd<T extends FrontendCmdTypes> = ProfileFrontendCmdInternal | AppFrontendCmd<T>

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
): ProfileFrontendCmdInternal[] => {
  switch (cmd?.t) {
    case 'profile-cmd.got-profile-loader-cmd': {
      return [cmd]
    }
    default: {
      return []
    }
  }
}

const tag = <T extends FrontendCmdTypes, Tag extends string>(
  t: Tag,
  cmds?: ProfileFrontendCmd<T>[],
): ProfileFrontendCmd<{
  MsgFrontend: { t: Tag; c: T['MsgFrontend'] }
  MsgToBackend: { t: Tag; c: T['MsgToBackend'] }
}>[] => {
  return (cmds ?? []).flatMap(
    (
      msgCmd,
    ): ProfileFrontendCmd<{
      MsgFrontend: { t: Tag; c: T['MsgFrontend'] }
      MsgToBackend: { t: Tag; c: T['MsgToBackend'] }
    }>[] => {
      if (isProfileFrontendCmdInternal(msgCmd)) {
        return [msgCmd]
      }
      return AppFrontendCmd.tag(t, [msgCmd])
    },
  )
}

export const ProfileFrontendCmd = {
  toAppFrontendCmd,
  tag,
  toProfileFrontendCmdBase,
}
