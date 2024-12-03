import { Sub } from '~/@/core'
import type { AppClientCmd, AppClientCtx } from '~/app/@/client'
import {
  Avatar,
  Button,
  ConfirmationDialog,
  IconArrowLeftOnRect,
  IconArrowRotateLeft,
  IconCheckmarkCircle,
  IconFlag,
  IconSpinner,
  IconXMark
} from '~/app/@/ui'
import { ViewBottomButtonBar, ViewBottomButtonBarAction } from '~/app/@/ui/actions'
import { SpaceClientCtx } from '~/app/spaces/@/space-client-ctx'
import { SpaceClientEvt } from '~/app/spaces/@/space-client-evt'
import { GameClientModule } from '~/app/spaces/games/@/architecture/game-client-v2'
import { VsUserSetupScreen } from '~/app/spaces/games/@/vs-user'
import { LayoutGame } from '../../@/game/layout-game'
import { type PlayerType, toTurn } from '../@/connect-four'
import { PlayerIcon, ViewColumns } from '../@/connect-four-ui'
import { CoverArt } from '../@/connect-four-ui/connect-four-cover-art'
import {
  type ModelClient,
  type ModelCore,
  type MsgClient,
  type MsgCore,
  type MsgToClient,
  type MsgToServer,
  type StateGame,
  type StateGameOver,
  toPlayerType
} from './vs-user.types'

//
//
//
//
//
//
//

type Module = GameClientModule<{
  Model: ModelClient
  Msg: MsgClient
  MsgToClient: MsgToClient
  MsgToServer: MsgToServer
  ModelCore: ModelCore
  MsgCore: MsgCore
  Ctx: SpaceClientCtx & { onQuit: () => void }
  MsgCmdIn: null
  MsgEvtIn: SpaceClientEvt
  MsgCmdOut: AppClientCmd<{
    MsgClient: MsgClient
    MsgToServer: MsgToServer
  }>
  MsgEvtOut: null
}>

//
//
//
// Model
//
//
//

const init: Module['init'] = {
  ghostIndex: null,
  openedModal: null
}

//
//
//
// Update
//
//
//

const update: Module['update'] = (input) => {
  return GameClientModule.andThen({ model: input.model }, (model) => updateFromMsg(model)(input))
}

const updateFromMsg =
  (model: ModelClient): Module['update'] =>
  (input) => {
    const { msg } = input

    if (!msg) {
      return {
        model
      }
    }

    switch (msg.t) {
      case 'clicked-resign': {
        return {
          model: {
            ...model,
            openedModal: 'confirm-resign'
          }
        }
      }

      case 'hovered-over-columns': {
        return {
          model: {
            ...model,
            ghostIndex: msg.columnIndex
          }
        }
      }

      case 'close-modal': {
        return {
          model: {
            ...model,
            openedModal: null
          }
        }
      }

      default: {
        return {
          model
        }
      }
    }
  }

//
//
//
// Subscriptions
//
//
//

const subscriptions: Module['subscriptions'] = () => {
  return Sub.None
}

//
//
//
// View
//
//
//

const View: Module['View'] = (input) => {
  if (!input.model) {
    return null
  }

  switch (input.modelCore.type) {
    case 'setup': {
      return (
        <VsUserSetupScreen
          ctx={input.ctx}
          title={input.ctx.t('connect-four')}
          renderCoverArt={(input) => {
            return (
              <div {...input}>
                <CoverArt />
              </div>
            )
          }}
          onStartGame={() => {
            input.dispatch({
              t: 'user-started-game',
              userId: input.ctx.currentUserId
            })
          }}
          onQuit={input.ctx.onQuit}
          playerOne={{
            label: input.ctx.t('connect-four.red'),
            onStartPlaying: () => {
              input.dispatch({
                t: 'user-started-playing',
                playerType: 'player-one',
                userId: input.ctx.currentUserId
              })
            },
            onStopPlaying: () => {
              input.dispatch({
                t: 'user-stopped-playing',
                userId: input.ctx.currentUserId
              })
            },
            renderIcon: (input) => {
              return <PlayerIcon playerType='player-one' {...input} />
            },
            userId: input.modelCore.players['player-one'] ?? null
          }}
          playerTwo={{
            label: input.ctx.t('connect-four.yellow'),
            onStartPlaying: () => {
              input.dispatch({
                t: 'user-started-playing',
                userId: input.ctx.currentUserId,
                playerType: 'player-two'
              })
            },
            onStopPlaying: () => {
              input.dispatch({
                t: 'user-stopped-playing',
                userId: input.ctx.currentUserId
              })
            },
            renderIcon: (input) => {
              return <PlayerIcon playerType='player-two' {...input} />
            },
            userId: input.modelCore.players['player-two'] ?? null
          }}
        />
      )
    }

    case 'game':
    case 'game-over': {
      const currentUserPlayerType = toPlayerType(input.ctx.currentUserId, input.modelCore)

      return (
        <LayoutGame ctx={input.ctx} isSpectating={currentUserPlayerType === null}>
          <div className='flex w-full flex-1 flex-col items-center justify-center gap-2'>
            <div className='flex w-full items-center gap-2 px-2'>
              <PlayerSlot playerType='player-one' modelCore={input.modelCore} ctx={input.ctx} />
              <PlayerSlot playerType='player-two' modelCore={input.modelCore} ctx={input.ctx} />
            </div>

            <Feedback ctx={input.ctx} modelCore={input.modelCore} />

            <div className='relative w-full'>
              <ViewColumns
                columns={input.modelCore.columns}
                gameId={input.modelCore.gameId}
                onDropDisc={(columnIndex) =>
                  input.dispatch({
                    t: 'user-dropped-disc',
                    userId: input.ctx.currentUserId,
                    columnIndex
                  })
                }
                onHover={(columnIndex) =>
                  input.dispatch({
                    t: 'hovered-over-columns',
                    columnIndex
                  })
                }
                disabled={
                  toTurn(input.modelCore.columns) !== currentUserPlayerType || input.modelCore.type === 'game-over'
                }
              />
              {input.modelCore.type === 'game-over' && (
                <div className='absolute left-0 top-0 flex h-full w-full items-center justify-center bg-black/50'>
                  <ViewGameOverMessage dispatch={input.dispatch} ctx={input.ctx} modelCore={input.modelCore} />
                </div>
              )}
            </div>
          </div>

          <ViewBottomButtonBar>
            {input.modelCore.type === 'game' && (
              <ViewBottomButtonBarAction
                icon={(input) => <IconFlag {...input} />}
                label={input.ctx.t('app.resign')}
                onClick={() => {
                  input.dispatch({
                    t: 'clicked-resign',
                    userId: input.ctx.currentUserId
                  })
                }}
              />
            )}

            {input.modelCore.type === 'game-over' && input.ctx.currentUserId === input.ctx.space.hostId && (
              <>
                <ViewBottomButtonBarAction
                  icon={(input) => <IconArrowLeftOnRect {...input} />}
                  label={input.ctx.t('app.exit')}
                  onClick={() => {
                    input.dispatch({
                      t: 'user-stopped-game',
                      userId: input.ctx.currentUserId
                    })
                  }}
                />

                <ViewBottomButtonBarAction
                  icon={(input) => <IconArrowRotateLeft {...input} />}
                  label={input.ctx.t('game.rematch')}
                  onClick={() => {
                    input.dispatch({
                      t: 'user-requested-rematch',
                      userId: input.ctx.currentUserId
                    })
                  }}
                />
              </>
            )}
          </ViewBottomButtonBar>

          <ConfirmationDialog
            headerIcon={<IconFlag className='h-10 w-10' />}
            title={input.ctx.t('app.resign')}
            onCancel={() =>
              input.dispatch({
                t: 'close-modal'
              })
            }
            onClose={() =>
              input.dispatch({
                t: 'close-modal'
              })
            }
            confirmTitle={input.ctx.t('app.resign')}
            onConfirm={() =>
              input.dispatch({
                t: 'user-resigned',
                userId: input.ctx.currentUserId
              })
            }
            open={input.model.openedModal === 'confirm-resign'}
          />
        </LayoutGame>
      )
    }
  }
}

const ViewGameOverMessage = ({
  ctx,
  modelCore,
  dispatch
}: {
  modelCore: StateGameOver
  ctx: AppClientCtx
  dispatch: (msg: MsgCore) => void
}) => {
  const currentPlayerType = toPlayerType(ctx.currentUserId, modelCore)

  if (modelCore.rematch.type === 'Asking' && modelCore.rematch.asker === currentPlayerType) {
    return (
      <>
        <p className='mb-4 text-center text-xl'>Waiting for response</p>
        <IconSpinner className='mb-4 h-8 w-8 animate-spin' />
        <Button
          variant='contained'
          onClick={() =>
            dispatch({
              t: 'user-cancelled-rematch',
              userId: ctx.currentUserId
            })
          }
          text={ctx.t('app.cancel')}
        />
      </>
    )
  }

  if (
    modelCore.rematch.type === 'Asking' &&
    modelCore.rematch.asker !== currentPlayerType &&
    currentPlayerType !== null
  ) {
    return (
      <>
        <p>Rematch?</p>
        <div className='flex w-full items-center justify-center gap-4'>
          <Button
            variant='contained'
            onClick={() =>
              dispatch({
                t: 'user-responded-to-rematch-request',
                userId: ctx.currentUserId,
                response: 'Decline'
              })
            }
            renderIconStart={(iconInput) => <IconXMark {...iconInput} />}
            text={ctx.t('app.decline')}
          />

          <Button
            variant='contained'
            onClick={() =>
              dispatch({
                t: 'user-responded-to-rematch-request',
                userId: ctx.currentUserId,
                response: 'Decline'
              })
            }
            renderIconStart={(iconInput) => <IconCheckmarkCircle {...iconInput} />}
            text={ctx.t('app.accept')}
          />
        </div>
      </>
    )
  }

  if (modelCore.gameOver.type === 'Draw') {
    return <p className='text-xl'>Tie</p>
  }

  if (modelCore.gameOver.type === 'resignation') {
    const { resigner } = modelCore.gameOver

    const winner: PlayerType = resigner === 'player-one' ? 'player-two' : 'player-one'

    if (currentPlayerType === null) {
      return (
        <>
          <div className='flex w-full items-center justify-center'>
            <PlayerIcon playerType={winner} />
            <Avatar alt='' src={ctx.profiles[modelCore.players[winner]]?.avatarUrl} />
          </div>
          <p>Winner</p>
        </>
      )
    }

    return (
      <>
        <p>{currentPlayerType === winner ? 'You Won' : 'You Lost'}</p>
        <p>by resignation</p>
      </>
    )
  }

  if (modelCore.gameOver.type === 'Winner') {
    const { winner } = modelCore.gameOver

    if (currentPlayerType === null) {
      return (
        <div className='flex w-full flex-col items-center justify-center gap-2'>
          <div className='flex w-full items-center justify-center gap-2'>
            <PlayerIcon playerType={winner} className='h-20 w-20' />
            <Avatar className='h-20 w-20' src={ctx.profiles[modelCore.players[winner]]?.avatarUrl} />
          </div>
          <p>Winner</p>
        </div>
      )
    }

    return <p>{currentPlayerType === winner ? 'You Won' : 'You Lost'}</p>
  }

  return null
}

const Feedback = ({ ctx, modelCore }: { ctx: SpaceClientCtx; modelCore: StateGame | StateGameOver }) => {
  if (modelCore.type === 'game-over') {
    return <p className='text-secondary flex items-center justify-center'>Game Over</p>
  }

  const turn = toTurn(modelCore.columns)

  const currentUserPlayerType = toPlayerType(ctx.currentUserId, modelCore)

  if (currentUserPlayerType !== turn) {
    return (
      <p className='text-secondary flex items-center justify-center gap-2 text-center'>
        <PlayerIcon className='h-4 w-4' playerType={turn} />
        Turn
      </p>
    )
  }

  return (
    <p className='flex items-center justify-center gap-2 text-center'>
      <PlayerIcon className='h-4 w-4' playerType={turn} />
      Your Turn
    </p>
  )
}

const PlayerSlot = ({
  modelCore,
  playerType,
  ctx
}: {
  modelCore: StateGame | StateGameOver
  playerType: PlayerType
  ctx: SpaceClientCtx
}) => {
  return (
    <div className='flex flex-1 items-center gap-2 overflow-hidden rounded border  p-2'>
      <PlayerIcon className='h-8 w-8' playerType={playerType} />
      <Avatar className='h-8 w-8' alt='' src={ctx.profiles[modelCore.players[playerType]]?.avatarUrl} />
      <p className='text-secondary'>{ctx.profiles[modelCore.players[playerType]]?.username ?? '...'}</p>
    </div>
  )
}

const ViewFeedItem: Module['ViewFeedItem'] = () => {
  return null
}

export const VsUser: Module = {
  init,
  update,
  subscriptions,
  View,
  ViewFeedItem
}
