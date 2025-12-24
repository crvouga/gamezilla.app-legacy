import { Sub } from '~/@/sub'

export type LogoutCmd = {
  t: 'logout'
}

export const logoutCmd = Sub.queued<LogoutCmd>()
