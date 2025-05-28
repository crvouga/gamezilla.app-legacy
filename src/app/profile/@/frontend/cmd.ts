import { AppFrontendCmd, FrontendCmdTypes } from '~/app/@/frontend/cmd'
import { ProfileLoaderTypes } from '../user-profile-loader'

export type ProfileFrontendCmdInternal = ProfileLoaderTypes.MsgInCmdFrontend

export const isProfileFrontendCmdInternal = <T extends FrontendCmdTypes>(
  cmd: ProfileFrontendCmd<T>,
): cmd is ProfileFrontendCmdInternal => {
  return cmd.n === 'profile-cmd'
}

export type ProfileFrontendCmd<T extends FrontendCmdTypes> = ProfileFrontendCmdInternal | AppFrontendCmd<T>

const toAppFrontendCmd = <T extends FrontendCmdTypes>(
  cmd: ProfileFrontendCmd<T> | null | undefined,
): AppFrontendCmd<T>[] => {
  if (!cmd) return []

  if (isProfileFrontendCmdInternal(cmd)) {
    return []
  }

  return [cmd]
}

const toProfileFrontendCmdInternal = <T extends FrontendCmdTypes>(
  cmd: ProfileFrontendCmd<T> | null | undefined,
): ProfileFrontendCmdInternal[] => {
  if (!cmd) return []

  if (isProfileFrontendCmdInternal(cmd)) {
    return [cmd]
  }

  return []
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
  toProfileFrontendCmdInternal,
}
