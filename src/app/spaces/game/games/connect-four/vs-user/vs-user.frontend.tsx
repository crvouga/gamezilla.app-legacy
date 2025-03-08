import { Sub } from '~/@/sub'
import {
  Avatar,
  Button,
  IconArrowLeftOnRect,
  IconArrowRotateLeft,
  IconCheckmarkCircle,
  IconFlag,
  IconSpinner,
  IconXMark,
} from '~/@/ui'
import { AppFrontendCmd } from '~/app/@/frontend/cmd'
import { AppFrontendCtx } from '~/app/@/frontend/ctx'
import { SurfaceConfirmation } from '~/app/@/ui/surface/confirmation/surface-confirmation'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import { SpaceFrontendCtx } from '~/app/spaces/@/frontend/ctx'
import { SpaceFrontendEvt } from '~/app/spaces/@/frontend/evt'
import { GameFrontendModule } from '~/app/spaces/game/games/@/architecture/game-frontend-v2'
import { VsUserSetupScreen } from '~/app/spaces/game/games/@/vs-user'
import { LayoutGame } from '../../@/ui/game-layout'
import { type PlayerType, toTurn } from '../@/connect-four'
import { PlayerIcon, ViewColumns } from '../@/connect-four-ui'
import { CoverArt } from '../@/connect-four-ui/connect-four-cover-art'
import {
  type ModelFrontend,
  type ModelSpace,
  type MsgFrontend,
  type MsgSpace,
  type MsgToBackend,
  type MsgToFrontend,
  type StateGame,
  type StateGameOver,
  toPlayerType,
} from './vs-user.types'

//
//
//
//
//
//
//

type Module = GameFrontendModule<{
  Model: ModelFrontend
  Msg: MsgFrontend
  MsgToFrontend: MsgToFrontend
  MsgToBackend: MsgToBackend
  ModelSpace: ModelSpace
  MsgSpace: MsgSpace
  Ctx: SpaceFrontendCtx & { onQuit: () => void }
  MsgCmdIn: null
  MsgEvtIn: SpaceFrontendEvt
  MsgCmdOut: AppFrontendCmd<{
    MsgFrontend: MsgFrontend
    MsgToBackend: MsgToBackend
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
  openedModal: null,
}

//
//
//
// Update
//
//
//

const update: Module['update'] = (input) => {
  return GameFrontendModule.andThen({ model: input.model }, (model) => updateFromMsg(model)(input))
}

const updateFromMsg =
  (model: ModelFrontend): Module['update'] =>
  (input) => {
    const { msg } = input

    if (!msg) {
      return {
        model,
      }
    }

    switch (msg.t) {
      case 'clicked-resign': {
        return {
          model: {
            ...model,
            openedModal: 'confirm-resign',
          },
        }
      }

      case 'hovered-over-columns': {
        return {
          model: {
            ...model,
            ghostIndex: msg.columnIndex,
          },
        }
      }

      case 'close-modal': {
        return {
          model: {
            ...model,
            openedModal: null,
          },
        }
      }

      default: {
        return {
          model,
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

  switch (input.modelSpace.type) {
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
              userId: input.ctx.currentUser.userId,
            })
          }}
          onQuit={input.ctx.onQuit}
          playerOne={{
            label: input.ctx.t('connect-four.red'),
            onStartPlaying: () => {
              input.dispatch({
                t: 'user-started-playing',
                playerType: 'player-one',
                userId: input.ctx.currentUser.userId,
              })
            },
            onStopPlaying: () => {
              input.dispatch({
                t: 'user-stopped-playing',
                userId: input.ctx.currentUser.userId,
              })
            },
            renderIcon: (input) => {
              return <PlayerIcon playerType='player-one' {...input} />
            },
            userId: input.modelSpace.players['player-one'] ?? null,
          }}
          playerTwo={{
            label: input.ctx.t('connect-four.yellow'),
            onStartPlaying: () => {
              input.dispatch({
                t: 'user-started-playing',
                userId: input.ctx.currentUser.userId,
                playerType: 'player-two',
              })
            },
            onStopPlaying: () => {
              input.dispatch({
                t: 'user-stopped-playing',
                userId: input.ctx.currentUser.userId,
              })
            },
            renderIcon: (input) => {
              return <PlayerIcon playerType='player-two' {...input} />
            },
            userId: input.modelSpace.players['player-two'] ?? null,
          }}
        />
      )
    }

    case 'game':
    case 'game-over': {
      const currentUserPlayerType = toPlayerType(input.ctx.currentUser.userId, input.modelSpace)
      const isSpectating = currentUserPlayerType === null
      const modelSpace = input.modelSpace
      return (
        <ScreenLayout
          parentScreen={input.ctx.parentScreen}
          id='connect-four-vs-user'
          ctx={input.ctx}
          renderBody={() => (
            <LayoutGame
              isSpectating={isSpectating}
              className='flex w-full flex-1 flex-col items-center justify-center gap-2'
              ctx={input.ctx}
            >
              <div className='flex w-full items-center gap-2 px-2'>
                <PlayerSlot playerType='player-one' modelSpace={modelSpace} ctx={input.ctx} />
                <PlayerSlot playerType='player-two' modelSpace={modelSpace} ctx={input.ctx} />
              </div>

              <Feedback ctx={input.ctx} modelSpace={modelSpace} />

              <div className='relative w-full'>
                <ViewColumns
                  columns={modelSpace.columns}
                  gameId={modelSpace.gameId}
                  onDropDisc={(columnIndex) =>
                    input.dispatch({
                      t: 'user-dropped-disc',
                      userId: input.ctx.currentUser.userId,
                      columnIndex,
                    })
                  }
                  onHover={(columnIndex) =>
                    input.dispatch({
                      t: 'hovered-over-columns',
                      columnIndex,
                    })
                  }
                  disabled={toTurn(modelSpace.columns) !== currentUserPlayerType || modelSpace.type === 'game-over'}
                />
                {input.modelSpace.type === 'game-over' && (
                  <div className='absolute left-0 top-0 flex h-full w-full items-center justify-center bg-black/50'>
                    <ViewGameOverMessage dispatch={input.dispatch} ctx={input.ctx} modelSpace={input.modelSpace} />
                  </div>
                )}
              </div>

              <SurfaceConfirmation
                id='resign-confirmation'
                position='bottom'
                title={input.ctx.t('app.resign')}
                ariaLabel={input.ctx.t('app.resign')}
                onCancel={() => input.dispatch({ t: 'close-modal' })}
                onClose={() => input.dispatch({ t: 'close-modal' })}
                confirmText={input.ctx.t('app.resign')}
                onConfirm={() => input.dispatch({ t: 'user-resigned', userId: input.ctx.currentUser.userId })}
                open={input.model.openedModal === 'confirm-resign'}
                ctx={input.ctx}
                body={input.ctx.t('app.resign')}
                cancelText={input.ctx.t('app.cancel')}
              />
            </LayoutGame>
          )}
          actionBar={{
            id: 'game-buttons',
            variant: {
              t: 'uniform',
              actions: [
                input.modelSpace.type === 'game'
                  ? {
                      key: input.ctx.t('app.resign'),
                      icon: (props: { className?: string }) => <IconFlag {...props} />,
                      label: input.ctx.t('app.resign'),
                      onClick: () => {
                        input.dispatch({
                          t: 'clicked-resign',
                          userId: input.ctx.currentUser.userId,
                        })
                      },
                    }
                  : null,
                input.modelSpace.type === 'game-over' && input.ctx.currentUser.userId === input.ctx.space.hostId
                  ? {
                      key: input.ctx.t('app.exit'),
                      icon: (props: { className?: string }) => <IconArrowLeftOnRect {...props} />,
                      label: input.ctx.t('app.exit'),
                      onClick: () => {
                        input.dispatch({
                          t: 'user-stopped-game',
                          userId: input.ctx.currentUser.userId,
                        })
                      },
                    }
                  : null,
                input.modelSpace.type === 'game-over' && input.ctx.currentUser.userId === input.ctx.space.hostId
                  ? {
                      key: input.ctx.t('game.rematch'),
                      icon: (props: { className?: string }) => <IconArrowRotateLeft {...props} />,
                      label: input.ctx.t('game.rematch'),
                      onClick: () => {
                        input.dispatch({
                          t: 'user-requested-rematch',
                          userId: input.ctx.currentUser.userId,
                        })
                      },
                    }
                  : null,
              ],
            },
          }}
        />
      )
    }
  }
}

const ViewGameOverMessage = ({
  ctx,
  modelSpace,
  dispatch,
}: {
  modelSpace: StateGameOver
  ctx: AppFrontendCtx
  dispatch: (msg: MsgSpace) => void
}) => {
  const currentPlayerType = toPlayerType(ctx.currentUser.userId, modelSpace)

  if (modelSpace.rematch.type === 'Asking' && modelSpace.rematch.asker === currentPlayerType) {
    return (
      <>
        <p className='mb-4 text-center text-xl'>Waiting for response</p>
        <IconSpinner className='mb-4 h-8 w-8 animate-spin' />
        <Button
          variant='contained'
          onClick={() =>
            dispatch({
              t: 'user-cancelled-rematch',
              userId: ctx.currentUser.userId,
            })
          }
          text={ctx.t('app.cancel')}
        />
      </>
    )
  }

  if (
    modelSpace.rematch.type === 'Asking' &&
    modelSpace.rematch.asker !== currentPlayerType &&
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
                userId: ctx.currentUser.userId,
                response: 'Decline',
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
                userId: ctx.currentUser.userId,
                response: 'Decline',
              })
            }
            renderIconStart={(iconInput) => <IconCheckmarkCircle {...iconInput} />}
            text={ctx.t('app.accept')}
          />
        </div>
      </>
    )
  }

  if (modelSpace.gameOver.type === 'Draw') {
    return <p className='text-xl'>Tie</p>
  }

  if (modelSpace.gameOver.type === 'resignation') {
    const { resigner } = modelSpace.gameOver

    const winner: PlayerType = resigner === 'player-one' ? 'player-two' : 'player-one'

    if (currentPlayerType === null) {
      return (
        <>
          <div className='flex w-full items-center justify-center'>
            <PlayerIcon playerType={winner} />
            <Avatar className='size-12' alt='' src={ctx.profiles[modelSpace.players[winner]]?.avatarUrl} />
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

  if (modelSpace.gameOver.type === 'Winner') {
    const { winner } = modelSpace.gameOver

    if (currentPlayerType === null) {
      return (
        <div className='flex w-full flex-col items-center justify-center gap-2'>
          <div className='flex w-full items-center justify-center gap-2'>
            <PlayerIcon playerType={winner} className='size-20' />
            <Avatar className='size-20' src={ctx.profiles[modelSpace.players[winner]]?.avatarUrl} />
          </div>
          <p>Winner</p>
        </div>
      )
    }

    return <p>{currentPlayerType === winner ? 'You Won' : 'You Lost'}</p>
  }

  return null
}

const Feedback = ({ ctx, modelSpace }: { ctx: SpaceFrontendCtx; modelSpace: StateGame | StateGameOver }) => {
  if (modelSpace.type === 'game-over') {
    return <p className='text-secondary flex items-center justify-center'>Game Over</p>
  }

  const turn = toTurn(modelSpace.columns)

  const currentUserPlayerType = toPlayerType(ctx.currentUser.userId, modelSpace)

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
  modelSpace,
  playerType,
  ctx,
}: {
  modelSpace: StateGame | StateGameOver
  playerType: PlayerType
  ctx: SpaceFrontendCtx
}) => {
  return (
    <div className='flex flex-1 items-center gap-2 overflow-hidden rounded border p-2'>
      <PlayerIcon className='h-8 w-8' playerType={playerType} />
      <Avatar className='h-8 w-8' alt='' src={ctx.profiles[modelSpace.players[playerType]]?.avatarUrl} />
      <p className='text-secondary'>{ctx.profiles[modelSpace.players[playerType]]?.username ?? '...'}</p>
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
  ViewFeedItem,
}
