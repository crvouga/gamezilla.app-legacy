import { Result, isErr } from '@/core'
import type { UserId } from 'gamezilla-app/app/@/data'
import * as TicTacToe from '../@/tic-tic-toe/tic-tac-toe'
import * as Round from './vs-user-round'

const { Err, Ok } = Result

//
//
//
// Model
//
//
//

export type CoreModel = SetupModel | ModelCore | GameOverModel

export type SetupModel = {
  type: 'setup'
  X: UserId | 'none'
  O: UserId | 'none'
  maxRoundCount: BestOutOf
  moveTimeLimit: MoveTimeLimit
}

export type ModelCore = {
  type: 'game'
  X: UserId
  O: UserId
  maxRoundCount: BestOutOf
  moveTimeLimit: MoveTimeLimit
  round: Round.Round
}

export type GameOverModel = {
  type: 'game-over'
  X: UserId
  O: UserId
  maxRoundCount: BestOutOf
  moveTimeLimit: MoveTimeLimit
  round: Round.Round
  gameOver: GameOver
  rematch: Rematch
}

type Rematch =
  | {
      type: 'NotAsking'
    }
  | {
      type: 'Asking'
      asker: TicTacToe.PlayerType
    }

const initCountDown = 5

export type GameOver =
  | {
      type: 'resignation'
      resigner: TicTacToe.PlayerType
    }
  | {
      type: 'Winner'
      winner: TicTacToe.PlayerType
    }
  | {
      type: 'Tie'
    }

export type BestOutOf = 1 | 3 | 5 | 7

export const allBestOutOf: BestOutOf[] = [1, 3, 5, 7]

export const bestOutOfToString = (bestOutOf: BestOutOf): string => {
  switch (bestOutOf) {
    case 1:
      return 'One'
    case 3:
      return 'Three'
    case 5:
      return 'Five'
    case 7:
      return 'Seven'
  }
}

export const toWinCount = ({ maxRoundCount }: Pick<ModelCore, 'maxRoundCount'>): number => {
  return Math.floor(maxRoundCount / 2) + 1
}

export type MoveTimeLimit = 3 | 5 | 10

export const allMoveTimeLimit: MoveTimeLimit[] = [3, 5, 10]

export const moveTimeLimitToString = (moveTimeLimit: MoveTimeLimit): string => {
  switch (moveTimeLimit) {
    case 3:
      return '3 Sec'
    case 5:
      return '5 Sec'
    case 10:
      return '10 Sec'
  }
}

export const initCoreModel = ({ X, O }: { X: SetupModel['X']; O: SetupModel['O'] }): CoreModel => {
  return {
    type: 'setup',
    O,
    X,
    maxRoundCount: 3,
    moveTimeLimit: 5
  }
}

export type ModelClient = CoreModel & {
  openedModal: 'none' | ModalName
}

export type ModelServer = CoreModel

export const parseModel = (): Result<string, CoreModel> => {
  return Err('unimplemented')
}

//
//
//
// Msg
//
//
//

type ModalName = 'resignation'

export type MsgClient = Req | ['OpenModal', ModalName] | ['close-modal']

export type MsgServer = RoundCountDown | MoveCountDown

export type MsgToServer = Req

export type MsgToClient = Res | RoundCountDown_Done | MoveCountDown_Done | ['player-left', CoreModel]

export type MsgCore = ['ClickedBoard', TicTacToe.Position]

export type Req =
  | InputPlayer
  | InputBestOutOf
  | StopPlaying
  | StartGame
  | Resign
  | InputMove
  | NewGame
  | RematchAsk
  | Rematch_Cancel
  | RematchAccept
  | RematchDecline

export type Res =
  | InputPlayer_Done
  | InputBestOutOf_Done
  | StopPlaying_Done
  | StartGame_Done
  | Resign_Done
  | InputMove_Done
  | NewGame_Done
  | RematchAsk_Done
  | Rematch_Cancel_Done
  | RematchAccept_Done
  | RematchDecline_Done

//
//
//
//
//
//
//

type InputPlayer = ['InputPlayer', { userId: UserId; playerType: TicTacToe.PlayerType }]
type InputPlayer_Done = ['InputPlayer_Done', Result<InputPlayerProblem, CoreModel>]
type InputPlayerProblem = 'player_is_taken' | 'must_be_in_setup_mode'

export const inputPlayer = ({ userId, playerType }: InputPlayer[1], model: CoreModel): InputPlayer_Done[1] => {
  if (model.type !== 'setup') {
    return Err('must_be_in_setup_mode')
  }

  const targetPlayer = model[playerType]

  if (targetPlayer !== 'none') {
    return Err('player_is_taken')
  }

  const otherPlayer = model[TicTacToe.toOpposite(playerType)]

  const otherPlayerNew = otherPlayer !== 'none' && otherPlayer === userId ? 'none' : otherPlayer

  const modelNew: CoreModel = {
    ...model,
    [playerType]: userId,
    [TicTacToe.toOpposite(playerType)]: otherPlayerNew
  }

  return Ok(modelNew)
}

type StopPlaying = ['stop-playing', { userId: UserId }]
type StopPlaying_Done = ['StopPlaying_Done', Result<StopPlayingProblem, CoreModel>]
type StopPlayingProblem = 'must_be_in_setup_mode' | 'not_playing'

export const stopPlaying = ({ userId }: StopPlaying[1], model: CoreModel): StopPlaying_Done[1] => {
  if (model.type !== 'setup') {
    return Err('must_be_in_setup_mode')
  }

  const isPlayingX = model.X === userId
  const isPlayingO = model.O === userId

  if (!isPlayingX && !isPlayingO) {
    return Err('not_playing')
  }

  const modelNew: CoreModel = {
    ...model,
    X: isPlayingX ? 'none' : model.X,
    O: isPlayingO ? 'none' : model.O
  }

  return Ok(modelNew)
}

//
//
//
//
//

type StartGame = ['start-game', { userId: UserId }]
type StartGame_Done = ['StartGame_Done', Result<StartGameProblem, CoreModel>]
type StartGameProblem = 'not_in_setup_mode' | 'missing_x' | 'missing_o' | 'missing_both' | 'not_playing'

export const startGame = ({ userId }: StartGame[1], model: CoreModel): StartGame_Done[1] => {
  if (model.type !== 'setup') {
    return Err('not_in_setup_mode')
  }

  if (model.X !== userId && model.O !== userId) {
    return Err('not_playing')
  }

  if (model.X === 'none' && model.O === 'none') {
    return Err('missing_both')
  }

  if (model.X === 'none') {
    return Err('missing_x')
  }

  if (model.O === 'none') {
    return Err('missing_o')
  }

  const modelNew: CoreModel = {
    type: 'game',
    X: model.X,
    O: model.O,
    moveTimeLimit: model.moveTimeLimit,
    maxRoundCount: model.maxRoundCount,
    round: {
      type: 'RoundStarting',
      countDown: 3
    }
  }

  return Ok(modelNew)
}

//
//
//
//
//

type Resign = ['resign', { userId: UserId }]
type Resign_Done = ['resign_Done', Result<ResignProblem, CoreModel>]
type ResignProblem = 'not_in_game_mode' | 'not_playing'

export const resign = ({ userId }: Resign[1], model: CoreModel): Resign_Done[1] => {
  if (model.type !== 'game') {
    return Err('not_in_game_mode')
  }

  const resigner: TicTacToe.PlayerType | 'none' = model.O === userId ? 'O' : model.X === userId ? 'X' : 'none'

  if (resigner === 'none') {
    return Err('not_playing')
  }

  const modelNew: CoreModel = {
    ...model,
    type: 'game-over',
    gameOver: {
      type: 'resignation',
      resigner
    },
    rematch: {
      type: 'NotAsking'
    }
  }

  return Ok(modelNew)
}

//
//
//
//
//

type InputMove = ['input-move', { userId: UserId; position: TicTacToe.Position }]
type InputMove_Done = ['input-move-done', Result<InputMoveProblem, CoreModel>]
type InputMoveProblem = TicTacToe.MoveProblem | 'not_playing' | 'not_game_mode' | 'round_not_started'

export const inputMove = ({ userId, position }: InputMove[1], model: CoreModel): InputMove_Done[1] => {
  if (model.type !== 'game') {
    return Err('not_game_mode')
  }

  const currentRound = Round.toCurrent(model.round)

  if (currentRound.type !== 'RoundStarted') {
    return Err('round_not_started')
  }

  const playerType: TicTacToe.PlayerType | 'none' = model.O === userId ? 'O' : model.X === userId ? 'X' : 'none'

  if (playerType === 'none') {
    return Err('not_playing')
  }

  const { board } = currentRound

  const result = TicTacToe.move({
    board,
    player: playerType,
    position
  })

  if (isErr(result)) {
    return result
  }

  const boardNew = result.value

  const roundOver = TicTacToe.toGameOver(boardNew)

  if (roundOver.type === 'none') {
    const modelNew: CoreModel = {
      ...model,
      round: Round.mapCurrent(model.round, () => ({
        type: 'RoundStarted',
        board: boardNew,
        moveCountDown: model.moveTimeLimit
      }))
    }

    return Ok(modelNew)
  }

  const modelNew: CoreModel = {
    ...model,
    round: Round.mapCurrent(model.round, () => ({
      type: 'RoundOver',
      roundOver,
      board: boardNew,
      next: {
        type: 'RoundStarting',
        countDown: initCountDown
      }
    }))
  }

  const gameOver = Round.toGameOver(modelNew)

  if (gameOver.type === 'none') {
    return Ok(modelNew)
  }

  return Ok({
    type: 'game-over',
    gameOver,
    maxRoundCount: modelNew.maxRoundCount,
    moveTimeLimit: modelNew.moveTimeLimit,
    O: modelNew.O,
    X: modelNew.X,
    round: modelNew.round,
    rematch: {
      type: 'NotAsking'
    }
  })
}

type MoveCountDown = ['MoveCountDown']
type MoveCountDown_Done = ['MoveCountDown_Done', Result<MoveCountDownProblem, CoreModel>]
type MoveCountDownProblem = 'not_in_game_mode' | 'round_not_started' | 'no_empty_positions' | InputMoveProblem

export const moveCountDown = (model: CoreModel): MoveCountDown_Done[1] => {
  if (model.type !== 'game') {
    return Err('not_in_game_mode')
  }

  const round = Round.toCurrent(model.round)

  if (round.type !== 'RoundStarted') {
    return Err('round_not_started')
  }

  const { board, moveCountDown } = round

  const moveCountDownNew = Math.max(moveCountDown - 1, 0)

  if (moveCountDownNew > 0) {
    const modelNew: CoreModel = {
      ...model,
      round: Round.mapCurrent(model.round, () => ({
        type: 'RoundStarted',
        board,
        moveCountDown: moveCountDownNew
      }))
    }

    return Ok(modelNew)
  }

  //
  // Times up. Make a random move for the current player
  //

  const emptyPositions = TicTacToe.toEmptyPositions(board)

  const randomPosition = emptyPositions[Math.floor(emptyPositions.length * Math.random())]

  if (!randomPosition) {
    return Err('no_empty_positions')
  }

  const turn = TicTacToe.toTurn(board)

  const result = inputMove(
    {
      userId: model[turn],
      position: randomPosition
    },
    model
  )

  return result
}

//
//
//
//
//
//

type NewGame = ['NewGame', { userId: UserId }]
type NewGame_Done = ['NewGame_Done', Result<NewGameProblem, CoreModel>]
type NewGameProblem = 'not_playing' | 'not_game_over'

export const NewGame = ({ userId }: NewGame[1], model: CoreModel): NewGame_Done[1] => {
  if (model.type !== 'game-over') {
    return Err('not_game_over')
  }

  if (model.X !== userId && model.O !== userId) {
    return Err('not_playing')
  }

  const modelNew: CoreModel = {
    type: 'setup',
    moveTimeLimit: model.moveTimeLimit,
    O: model.O,
    X: model.X,
    maxRoundCount: model.maxRoundCount
  }

  return Ok(modelNew)
}

export const NewGameToString = (result: NewGame_Done[1]): string => {
  if (result.t === 'ok') {
    return ''
  }

  switch (result.error) {
    case 'not_game_over': {
      return 'Game must be over'
    }

    case 'not_playing': {
      return 'Must be playing to start a new game'
    }
  }
}

//
//
//
//
//
//

type InputBestOutOf = ['InputBestOutOf', { userId: UserId; bestOutOf: BestOutOf }]
type InputBestOutOf_Done = ['InputBestOutOf_Done', Result<InputBestOutOfProblem, CoreModel>]
type InputBestOutOfProblem = 'not_in_setup_mode' | 'not_playing'

export const inputBestOutOf = ({ userId, bestOutOf }: InputBestOutOf[1], model: CoreModel): InputBestOutOf_Done[1] => {
  if (model.type !== 'setup') {
    return Err('not_in_setup_mode')
  }

  if (model.X !== userId && model.O !== userId) {
    return Err('not_playing')
  }

  const modelNew: CoreModel = {
    ...model,
    maxRoundCount: bestOutOf
  }

  return Ok(modelNew)
}

export const inputBestOutOfToString = (result: InputBestOutOf_Done[1]): string => {
  if (result.t === 'ok') {
    return ''
  }

  switch (result.error) {
    case 'not_in_setup_mode': {
      return 'Must be in setup mode to change'
    }

    case 'not_playing': {
      return 'Must be playing to change'
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
//
//
// Round Count Down Elapsed
//
//
//

type RoundCountDown = ['RoundCountDown']
type RoundCountDown_Done = ['RoundCountDown_Done', Result<RoundCountDownProblem, CoreModel>]
type RoundCountDownProblem = 'not_in_game_mode' | 'round_not_starting'

export const roundCountDown = (model: CoreModel): RoundCountDown_Done[1] => {
  if (model.type !== 'game') {
    return Err('not_in_game_mode')
  }

  const round = Round.toCurrent(model.round)

  if (round.type !== 'RoundStarting') {
    return Err('round_not_starting')
  }

  const countDownNew = Math.max(round.countDown - 1, 0)

  if (countDownNew === 0) {
    const modelNew: CoreModel = {
      ...model,
      round: Round.mapCurrent(model.round, () => ({
        type: 'RoundStarted',
        board: TicTacToe.emptyBoard,
        moveCountDown: model.moveTimeLimit
      }))
    }

    return Ok(modelNew)
  }

  const modelNew: CoreModel = {
    ...model,
    round: Round.mapCurrent(model.round, () => ({
      type: 'RoundStarting',
      countDown: countDownNew
    }))
  }

  return Ok(modelNew)
}

//
//
//
// Rematch
//
//
//

type RematchAsk = ['RematchAsk', { userId: UserId }]
type RematchAsk_Done = ['RematchAsk_Done', Result<RematchAskProblem, CoreModel>]
type RematchAskProblem = 'not_game_over' | 'already_asking' | 'not_player'

export const rematchAsk = ({ userId }: RematchAsk[1], model: CoreModel): RematchAsk_Done[1] => {
  if (model.type !== 'game-over') {
    return Err('not_game_over')
  }

  if (model.rematch.type === 'Asking') {
    return Err('already_asking')
  }

  if (model.O === userId) {
    return Ok({
      ...model,
      rematch: {
        type: 'Asking',
        asker: 'O'
      }
    })
  }

  if (model.X === userId) {
    return Ok({
      ...model,
      rematch: {
        type: 'Asking',
        asker: 'X'
      }
    })
  }

  return Err('not_player')
}

export const rematchAskToString = (result: RematchAsk_Done[1]): string => {
  if (result.t === 'ok') {
    return ''
  }

  switch (result.error) {
    case 'already_asking': {
      return 'Already asking for a rematch'
    }

    case 'not_game_over': {
      return 'Game must be over to rematch'
    }

    case 'not_player': {
      return 'Must be playing to ask for a rematch'
    }
  }
}

type Rematch_Cancel = ['Rematch_Cancel', { userId: UserId }]
type Rematch_Cancel_Done = ['Rematch_Cancel_Done', Result<Rematch_CancelProblem, CoreModel>]
type Rematch_CancelProblem = 'not_game_over' | 'not_asking' | 'not_asker' | 'not_player'

export const rematchCancel = ({ userId }: Rematch_Cancel[1], model: CoreModel): Rematch_Cancel_Done[1] => {
  if (model.type !== 'game-over') {
    return Err('not_game_over')
  }

  if (model.rematch.type !== 'Asking') {
    return Err('not_asking')
  }

  const playerType: TicTacToe.PlayerType | 'none' = model.X === userId ? 'X' : model.O === userId ? 'O' : 'none'

  if (playerType === 'none') {
    return Err('not_player')
  }

  if (model.rematch.asker !== playerType) {
    return Err('not_asker')
  }

  return Ok({ ...model, rematch: { type: 'NotAsking' } })
}

type RematchDecline = ['RematchDecline', { userId: UserId }]
type RematchDecline_Done = ['RematchDecline_Done', Result<RematchDeclineProblem, CoreModel>]
type RematchDeclineProblem = 'not_game_over' | 'not_player' | 'is_asker' | 'not_asking'

export const rematchDecline = ({ userId }: RematchDecline[1], model: CoreModel): RematchDecline_Done[1] => {
  if (model.type !== 'game-over') {
    return Err('not_game_over')
  }

  if (model.rematch.type !== 'Asking') {
    return Err('not_asking')
  }

  if (model.rematch.asker === userId) {
    return Err('is_asker')
  }

  if (model.O !== userId && model.X !== userId) {
    return Err('not_player')
  }

  return Ok({ ...model, rematch: { type: 'NotAsking' } })
}

type RematchAccept = ['RematchAccept', { userId: UserId }]
type RematchAccept_Done = ['RematchAccept_Done', Result<RematchAcceptProblem, CoreModel>]
type RematchAcceptProblem = 'not_game_over' | 'not_player' | 'is_asker' | 'not_asking'

export const rematchAccept = ({ userId }: RematchAccept[1], model: CoreModel): RematchAccept_Done[1] => {
  if (model.type !== 'game-over') {
    return Err('not_game_over')
  }

  if (model.rematch.type !== 'Asking') {
    return Err('not_asking')
  }

  if (model.rematch.asker === userId) {
    return Err('is_asker')
  }

  if (model.O !== userId && model.X !== userId) {
    return Err('not_player')
  }

  return Ok({
    type: 'game',
    maxRoundCount: model.maxRoundCount,
    moveTimeLimit: model.moveTimeLimit,
    O: model.O,
    X: model.X,
    round: {
      type: 'RoundStarting',
      countDown: 3
    }
  })
}
