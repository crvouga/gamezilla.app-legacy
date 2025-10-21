import { Sub } from '~/@/sub'

export type ExitGameCmd = {
  t: 'exitGame'
}

export const exitGameCmds = Sub.queued<ExitGameCmd>()
