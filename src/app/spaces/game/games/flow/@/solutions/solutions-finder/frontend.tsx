import { pipe } from '~/@/function/pipe'
import { isErr, Loading, mapOk } from '~/@/result'
import { IconLightbulb } from '~/@/ui'
import { APP_SOUND, playSound, showErrSm, showToast } from '~/app/@/frontend/cmd'
import { ScreenAction } from '~/app/@/ui/screen/action-bar/screen-action-bar-props'
import { SurfaceConfirmation } from '~/app/@/ui/surface/confirmation/surface-confirmation'
import { AlgoSolveAsync } from '../algo-solve-async'
import { SolutionHash } from '../solution-hash/solution-hash'
import { Solutions } from '../solutions'
import {
  FindSolutionRequest,
  FoundSolutionResult,
  initFrontend,
  ModelFrontend,
  type FrontendModule,
  type MsgFrontend,
  type MsgInCmdFrontend,
} from './types'

const update: FrontendModule['update'] = (input) => {
  switch (input.msgCmd?.t) {
    case 'flow-cmd.got-solutions-finder-cmd': {
      return update({ ...input, msgCmd: null, msg: input.msgCmd.c.msg })
    }
  }

  switch (input.msg?.t) {
    case 'dialog.clicked-open': {
      const isOpen = input.model.open === 'find-solutions-confirmation'
      if (isOpen) {
        return {
          model: { ...input.model, open: null },
          msgCmd: [playSound(APP_SOUND.surfaceClosed)],
        }
      }
      return {
        model: { ...input.model, open: 'find-solutions-confirmation' },
        msgCmd: [playSound(APP_SOUND.surfaceOpened)],
      }
    }
    case 'dialog.clicked-close': {
      return {
        model: { ...input.model, open: null },
        msgCmd: [playSound(APP_SOUND.surfaceClosed)],
      }
    }
    case 'clicked-find-solutions': {
      const { flow } = input.msg
      const hash = SolutionHash.init(flow)
      const requestNew: FindSolutionRequest = {
        hash,
        result: Loading,
      }
      return {
        model: {
          ...input.model,
          requests: {
            ...input.model.requests,
            [hash]: requestNew,
          },
        },
        msgCmd: [playSound(APP_SOUND.tap)],
        async eff(dispatch) {
          const solved = await AlgoSolveAsync.solveInProcess({ model: flow, logger: input.ctx.logger })
          const found: FoundSolutionResult = pipe(
            solved,
            (s) => mapOk(s, (solution) => Solutions.of(solution ? [solution] : [])),
            (s) => mapOk(s, (solutions) => ({ solutions })),
          )
          dispatch({ t: 'found-solution', flow, found })
        },
      }
    }
    case 'found-solution': {
      const { msg } = input
      const hash = SolutionHash.init(msg.flow)
      const requestNew: FindSolutionRequest = {
        hash,
        result: input.msg.found,
      }
      return {
        model: {
          ...input.model,
          requests: {
            ...input.model.requests,
            [hash]: requestNew,
          },
        },

        msgCmd: isErr(msg.found)
          ? showErrSm(input.ctx.t('app.something-went-wrong'), msg.found.error)
          : [playSound(APP_SOUND.refreshFeed), showToast(input.ctx.t('flow.solutions-found'))],

        async eff() {
          if (isErr(msg.found)) return
          await input.ctx.solutionsDb.put(msg.found.value.solutions)
        },
      }
    }
  }
  return { model: input.model }
}

const TEST_ID = 'find-solutions'

const isFindSolutionsScreenAction = (action: ScreenAction): boolean => {
  return action.testId === TEST_ID
}

const viewAction = (input: Parameters<FrontendModule['View']>[0]): ScreenAction[] => {
  if (!input.ctx.flow) return []
  const hash = SolutionHash.init(input.ctx.flow)
  const hasSolution = Solutions.selectOne(input.ctx.solutions, hash) !== null
  if (hasSolution) return []
  return [
    {
      icon: (input) => <IconLightbulb {...input} />,
      label: input.ctx.t('game.hint'),
      onClick: () => input.dispatch({ t: 'dialog.clicked-open' }),
      testId: TEST_ID,
      renderSurface: ({ reference }) => (
        <SurfaceConfirmation
          title={input.ctx.t('flow.find-solutions')}
          body={input.ctx.t('flow.find-solutions-confirmation-body')}
          ctx={input.ctx}
          dropDownReference={reference}
          id='solutions-finder'
          ariaLabel={input.ctx.t('flow.find-solutions')}
          onClose={() => input.dispatch({ t: 'dialog.clicked-close' })}
          open={input.model.open === 'find-solutions-confirmation'}
          onCancel={() => input.dispatch({ t: 'dialog.clicked-close' })}
          cancelText={input.ctx.t('app.cancel')}
          position='bottom'
          confirmText={input.ctx.t('app.find')}
          confirmLoading={isLoading(input.model, hash)}
          onConfirm={() => {
            if (!input.ctx.flow) return
            input.dispatch({ t: 'clicked-find-solutions', flow: input.ctx.flow })
          }}
        />
      ),
    },
  ]
}

const gotMsg = (msg: MsgFrontend): MsgInCmdFrontend => {
  return {
    t: 'flow-cmd.got-solutions-finder-cmd',
    c: {
      t: 'got-msg',
      msg,
    },
  }
}

const isLoading = (model: ModelFrontend, hash: SolutionHash): boolean => {
  return model.requests[hash]?.result.t === 'loading'
}

export const SolutionsFinderFrontend = {
  init: initFrontend,
  isLoading,
  update,
  viewAction,
  gotMsg,
  isFindSolutionsScreenAction,
}
