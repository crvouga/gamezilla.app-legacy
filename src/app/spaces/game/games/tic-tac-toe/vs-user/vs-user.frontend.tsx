import { type AppFrontendCmd, sendToBackend } from '~/app/@/frontend/cmd'
import { SpaceFrontendCtx } from '~/app/spaces/@/space-frontend/ctx'
import { VsUserSetupScreen } from '~/app/spaces/game/games/@/vs-user'
import { toTurn } from '../@/tic-tic-toe/tic-tac-toe'
import { CoverArt, PlayerTypeIcon } from '../@/tic-tic-toe/tic-tac-toe-ui'
import * as Round from './vs-user-round'
import {
  type ModelFrontend,
  type ModelBackend,
  type MsgFrontend,
  type MsgToFrontend,
  type MsgToBackend,
  type Res,
  initCoreModel,
} from './vs-user.types'

//
//
//
// Model
//
//
//

export const init: ModelFrontend = {
  ...initCoreModel({ X: 'none', O: 'none' }),
  openedModal: 'none',
}

//
//
// Update
//
//
//

export const update = (
  msg: MsgFrontend,
  model: ModelFrontend,
): {
  model: ModelFrontend
  msgCmd?: AppFrontendCmd<{
    MsgToBackend: MsgToBackend
    MsgFrontend: MsgFrontend
  }>[]
} => {
  switch (msg[0]) {
    //
    //
    // Frontend Msg
    //
    //

    case 'close-modal': {
      return {
        model: {
          ...model,
          openedModal: 'none',
        },
      }
    }

    case 'OpenModal': {
      return {
        model: {
          ...model,
          openedModal: msg[1],
        },
      }
    }

    //
    //
    //
    // Request Msg
    //
    //
    //

    case 'RematchAccept':
    case 'RematchAsk':
    case 'RematchDecline':
    case 'Rematch_Cancel':
    case 'InputBestOutOf':
    case 'input-move':
    case 'resign':
    case 'InputPlayer':
    case 'stop-playing':
    case 'start-game':
    case 'NewGame': {
      return {
        model,
        msgCmd: [sendToBackend(msg)],
      }
    }

    default: {
      return {
        model,
      }
    }
  }
}

export const updateFromBackend = (
  _: { ctx: SpaceFrontendCtx },
  msg: MsgToFrontend,
  model: ModelFrontend,
): [ModelFrontend] => {
  switch (msg[0]) {
    case 'player-left': {
      const modelNew = mergeWithBackend(model, msg[1])
      return [modelNew]
    }

    case 'RematchAccept_Done':
    case 'RematchAsk_Done':
    case 'Rematch_Cancel_Done':
    case 'NewGame_Done':
    case 'InputBestOutOf_Done':
    case 'input-move-done':
    case 'InputPlayer_Done':
    case 'StopPlaying_Done':
    case 'StartGame_Done':
    case 'RematchDecline_Done':
    case 'resign_Done': {
      const res: Res = msg

      if (res[1].t === 'err') {
        return [model]
      }

      const modelNew = mergeWithBackend(model, res[1].value)

      return [
        {
          ...modelNew,
          openedModal: 'none',
        },
      ]
    }

    case 'MoveCountDown_Done':
    case 'RoundCountDown_Done': {
      if (msg[1].t === 'err') {
        return [model]
      }

      const modelNew = mergeWithBackend(model, msg[1].value)

      return [modelNew]
    }

    default: {
      return [model]
    }
  }
}

export const mergeWithBackend = (frontendModel: ModelFrontend, backendModel: ModelBackend): ModelFrontend => {
  return {
    ...backendModel,
    openedModal: frontendModel.openedModal,
  }
}

//
//
//
// View
//
//
//

export const View = ({
  ctx,
  model,
  dispatch,
  onCloseGame,
}: {
  ctx: SpaceFrontendCtx
  model: ModelFrontend
  dispatch: (msg: MsgFrontend) => void
  onCloseGame: () => void
}) => {
  if (model.type === 'setup') {
    return (
      <VsUserSetupScreen
        ctx={ctx}
        onQuit={onCloseGame}
        onStartGame={() =>
          dispatch([
            'start-game',
            {
              userId: ctx.currentUserId,
            },
          ])
        }
        renderCoverArt={(input) => {
          return (
            <div {...input}>
              <CoverArt />
            </div>
          )
        }}
        title={ctx.t('tic-tac-toe')}
        canStartGame={model.X !== 'none' && model.O !== 'none'}
        playerOne={{
          label: ctx.t('tic-tac-toe.cross'),
          userId: model.X === 'none' ? null : model.X,
          renderIcon: (input) => {
            return <PlayerTypeIcon playerType='X' {...input} />
          },
          onStartPlaying: () => {
            dispatch([
              'InputPlayer',
              {
                playerType: 'X',
                userId: ctx.currentUserId,
              },
            ])
          },
          onStopPlaying: () => {
            dispatch([
              'InputPlayer',
              {
                playerType: 'X',
                userId: ctx.currentUserId,
              },
            ])
          },
        }}
        playerTwo={{
          label: ctx.t('tic-tac-toe.naught'),
          userId: model.O === 'none' ? null : model.O,
          renderIcon: (input) => {
            return <PlayerTypeIcon playerType='O' {...input} />
          },
          onStartPlaying: () => {
            dispatch([
              'InputPlayer',
              {
                playerType: 'O',
                userId: ctx.currentUserId,
              },
            ])
          },
          onStopPlaying: () => {
            dispatch([
              'InputPlayer',
              {
                playerType: 'O',
                userId: ctx.currentUserId,
              },
            ])
          },
        }}
      />
    )
  }

  if (model.type === 'game') {
    return <div />
  }

  return <div />
}

export const toGameText = ({ model }: { model: ModelFrontend }): string => {
  switch (model.type) {
    case 'setup': {
      return 'Setting up'
    }

    case 'game-over': {
      switch (model.gameOver.type) {
        case 'resignation': {
          return 'Resigned'
        }

        case 'Winner': {
          // const userId = model[model.gameOver.winner];

          return 'won'
        }

        case 'Tie': {
          return 'Tie'
        }

        default: {
          return 'Game Over'
        }
      }
    }

    case 'game': {
      const currentRound = Round.toCurrent(model.round)

      switch (currentRound.type) {
        case 'RoundOver': {
          switch (currentRound.roundOver.type) {
            case 'Tie': {
              return 'Tie'
            }

            case 'Win': {
              return `${currentRound.roundOver.winner} won`
            }

            default: {
              return 'Round Over'
            }
          }
        }
        case 'RoundStarted': {
          const turn = toTurn(currentRound.board)
          return `${turn} Turn`
        }

        case 'RoundStarting': {
          return 'Starting...'
        }

        default: {
          return 'Starting...'
        }
      }
    }
  }
}

//
//
//
//
//
//
//
