import { Sub } from '~/@/sub'
import { FlowFrontendCmdRoot } from '../../frontend/cmd-root'
import { FlowFrontendCtxBase } from '../../frontend/ctx-base'
import { SolutionHash } from '../solution-hash/solution-hash'
import type { FrontendModule, MsgFrontend, MsgInCmdFrontend } from './types'

const update: FrontendModule['update'] = (input) => {
  switch (input.msgCmd?.c.t) {
    case 'got-msg': {
      return update({ ...input, msgCmd: null, msg: input.msgCmd.c.msg })
    }
  }

  switch (input.msg?.t) {
    case 'got-solutions-db-solutions': {
      return {
        model: input.model,
        msgCmd: [FlowFrontendCmdRoot.addSolutions(input.msg.solutions, input.msg)],
      }
    }
  }

  return { model: input.model }
}

const gotMsg = (msg: MsgFrontend): MsgInCmdFrontend => {
  return { t: 'solutions-db-query', c: { t: 'got-msg', msg } }
}

const watch = <TMsg,>(
  ctx: FlowFrontendCtxBase,
  solutionHash: SolutionHash | null,
  map: (m: MsgFrontend) => TMsg,
): Sub<TMsg> => {
  if (!solutionHash) {
    return Sub.None
  }
  return Sub.map(ctx.solutionsDb.sub(solutionHash), (solutions) => map({ t: 'got-solutions-db-solutions', solutions }))
}

export const SolutionsLoaderFrontend = {
  update,
  watch,
  gotMsg,
}
