import { pipe } from '~/@/function/pipe'
import { isErr, Loading, mapErr, mapOk } from '~/@/result'
import { TimeSpan } from '~/@/time/time-span'
import { IconLightbulb } from '~/@/ui'
import { APP_SOUND, playSound, showErrSm, showOkSm, showWarningSm } from '~/app/@/frontend/cmd'
import { ScreenAction } from '~/app/@/ui/screen/action-bar/screen-action-bar-props'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import { SurfaceConfirmation } from '~/app/@/ui/surface/confirmation/surface-confirmation'
import { AlgoSolveAsync } from '../algo-solve-async'
import { problemToString } from '../algo-solve-async/algo-solve-async'
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
    case 'flow-cmd.got-hint-calculator-cmd': {
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
          const solved = await AlgoSolveAsync.solveInProcess({
            model: flow,
            logger: input.ctx.logger,
            maxDuration: TimeSpan.seconds(10),
          })
          const found: FoundSolutionResult = pipe(
            solved,
            (s) => mapOk(s, (solution) => Solutions.of(solution ? [solution] : [])),
            (s) => mapOk(s, (solutions) => ({ solutions })),
            (s) => mapErr(s, problemToString),
          )
          dispatch({ t: 'found-solution', flow, found })
        },
      }
    }
    case 'found-solution': {
      const result = input.msg.found
      const hash = SolutionHash.init(input.msg.flow)
      const requestNew: FindSolutionRequest = { hash, result }
      return {
        model: { ...input.model, requests: { ...input.model.requests, [hash]: requestNew }, open: null },
        msgCmd: isErr(result)
          ? showErrSm(input.ctx.t('app.something-went-wrong'), result.error)
          : Solutions.isEmpty(result.value.solutions)
            ? showWarningSm(input.ctx.t('flow.no-solutions-found'))
            : showOkSm(input.ctx.t('flow.solutions-found')),
        async eff() {
          if (isErr(result)) return
          await input.ctx.solutionsDb.put(result.value.solutions)
        },
      }
    }
  }
  return { model: input.model }
}

const TEST_ID_HINT_CALCULATOR_ACTION = 'hint-calculator'

const viewActions = (input: Parameters<FrontendModule['View']>[0]): ScreenAction[] => {
  const { flow } = input.ctx
  if (!flow) return []
  const hash = SolutionHash.init(flow)
  const hasSolution = Solutions.selectOne(input.ctx.solutions, hash) !== null
  if (hasSolution) return []
  return [
    {
      id: input.ctx.t('game.hint'),
      icon: (input) => <IconLightbulb {...input} />,
      label: input.ctx.t('game.hint'),
      onClick: () => input.dispatch({ t: 'dialog.clicked-open' }),
      testId: TEST_ID_HINT_CALCULATOR_ACTION,
      renderSurface: ({ dropDown }) => (
        <SurfaceConfirmation
          title={input.ctx.t('flow.no-hints-available')}
          body={input.ctx.t('flow.no-hints-available-body')}
          ctx={input.ctx}
          dropDown={dropDown}
          id={TEST_ID_HINT_CALCULATOR_ACTION}
          ariaLabel={input.ctx.t('flow.no-hints-available')}
          onClose={() => input.dispatch({ t: 'dialog.clicked-close' })}
          open={input.model.open === 'find-solutions-confirmation'}
          onCancel={() => input.dispatch({ t: 'dialog.clicked-close' })}
          cancelText={input.ctx.t('app.cancel')}
          position='bottom'
          confirmText={input.ctx.t('app.calculate')}
          confirmLoading={isLoading(input.model, hash)}
          onConfirm={() => input.dispatch({ t: 'clicked-find-solutions', flow })}
        />
      ),
    },
  ]
}

const gotMsg = (msg: MsgFrontend): MsgInCmdFrontend => {
  return {
    t: 'flow-cmd.got-hint-calculator-cmd',
    c: {
      t: 'got-msg',
      msg,
    },
  }
}

const isLoading = (model: ModelFrontend, hash: SolutionHash): boolean => {
  return model.requests[hash]?.result.t === 'loading'
}

const TestView: FrontendModule['View'] = (input) => {
  return (
    <ScreenLayout
      {...input}
      id='hint-calculator'
      parentScreen={null}
      actionBar={{ variant: { t: 'uniform', actions: viewActions(input) } }}
      renderBody={() => null}
    />
  )
}

export const HintCalculatorFrontend = {
  init: initFrontend,
  isLoading,
  update,
  viewActions,
  TestView,
  TEST_ID_HINT_CALCULATOR_ACTION,
  gotMsg,
}
