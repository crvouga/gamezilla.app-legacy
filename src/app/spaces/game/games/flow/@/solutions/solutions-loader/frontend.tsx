import { Sub } from '~/@/sub'
import { AddSolutionsCmd } from '../../frontend/add-solutions-cmd'
import { FlowFrontendCtxBase } from '../../frontend/ctx-base'
import { SolutionHash } from '../solution-hash/solution-hash'
import { GotSolutionsLoaderMsg } from './got-solutions-loader-msg'
import type { FrontendModule, MsgFrontend } from './types'

const update: FrontendModule['update'] = (input) => {
  if (GotSolutionsLoaderMsg.is(input.msgIn)) {
    return update({ ...input, msgIn: null, msg: input.msgIn.c.msg })
  }

  switch (input.msg?.t) {
    case 'got-solutions-db-solutions': {
      return {
        model: input.model,
        msgOut: [AddSolutionsCmd.init(input.msg.solutions, input.msg)],
      }
    }
  }

  return { model: input.model }
}

const watch = <TMsg,>(
  ctx: FlowFrontendCtxBase,
  solutionHash: SolutionHash | null,
  map: (m: MsgFrontend) => TMsg,
): Sub<TMsg> => {
  if (!solutionHash) return Sub.None

  return Sub.map(ctx.solutionsDb.sub(solutionHash), (solutions) => map({ t: 'got-solutions-db-solutions', solutions }))
}

export const SolutionsLoaderFrontend = {
  update,
  watch,
}
