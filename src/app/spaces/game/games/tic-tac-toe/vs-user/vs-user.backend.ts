// import { isErr } from '~/@/result'
// import { Sub } from '~/@/sub'
// import { Time } from '~/@/time/time'
// import { TimeSpan } from '~/@/time/time-span'
// import { SpaceBackendCtx } from '~/app/spaces/@/backend/ctx'
// import { toOpposite, toTurn, type PlayerType } from '../@/tic-tic-toe/tic-tac-toe'
// import * as Round from './vs-user-round'
// import {
//   NewGame,
//   initSpaceModel,
//   inputBestOutOf,
//   inputMove,
//   inputPlayer,
//   moveCountDown,
//   rematchAccept,
//   rematchAsk,
//   rematchCancel,
//   rematchDecline,
//   resign,
//   roundCountDown,
//   startGame,
//   stopPlaying,
//   type ModelBackend,
//   type MsgBackend,
//   type MsgToBackend,
// } from './vs-user.types'

// //
// //
// //
// // Model
// //
// //
// //

// export type Model = ModelBackend

// export const init = initSpaceModel

// //
// //
// //
// // Update
// //
// //
// //

// export type Msg = MsgBackend

// export const update = (
//   msg: Msg,
//   model: Model,
// ): {
//   model: Model
// } => {
//   switch (msg[0]) {
//     case 'RoundCountDown': {
//       const result = roundCountDown(model)

//       const modelNew = isErr(result) ? model : result.value

//       return {
//         model: modelNew,
//       }
//     }

//     case 'MoveCountDown': {
//       const result = moveCountDown(model)

//       const modelNew = isErr(result) ? model : result.value

//       return {
//         model: modelNew,
//       }
//     }
//   }
// }

// export const updateFromFrontend = (
//   _ctx: SpaceBackendCtx,
//   msg: MsgToBackend,
//   model: Model,
// ): {
//   model: Model
// } => {
//   switch (msg[0]) {
//     case 'InputPlayer': {
//       const result = inputPlayer(msg[1], model)

//       if (isErr(result)) {
//         return {
//           model,
//         }
//       }

//       const modelNew = result.value

//       return {
//         model: modelNew,
//       }
//     }

//     case 'stop-playing': {
//       const result = stopPlaying(msg[1], model)

//       if (isErr(result)) {
//         return {
//           model,
//         }
//       }

//       const modelNew = result.value
//       return {
//         model: modelNew,
//       }
//     }

//     case 'start-game': {
//       const result = startGame(msg[1], model)

//       if (isErr(result)) {
//         return {
//           model,
//         }
//       }

//       const modelNew = result.value
//       return {
//         model: modelNew,
//       }
//     }

//     case 'resign': {
//       const result = resign(msg[1], model)

//       if (isErr(result)) {
//         return {
//           model,
//         }
//       }

//       const modelNew = result.value
//       return {
//         model: modelNew,
//       }
//     }

//     case 'input-move': {
//       const result = inputMove(msg[1], model)

//       if (isErr(result)) {
//         return {
//           model,
//         }
//       }

//       const modelNew = result.value
//       return {
//         model: modelNew,
//       }
//     }

//     case 'NewGame': {
//       const result = NewGame(msg[1], model)

//       if (isErr(result)) {
//         return {
//           model,
//         }
//       }

//       const modelNew = result.value

//       return {
//         model: modelNew,
//       }
//     }

//     case 'InputBestOutOf': {
//       const result = inputBestOutOf(msg[1], model)

//       if (isErr(result)) {
//         return {
//           model,
//         }
//       }

//       const modelNew = result.value
//       return {
//         model: modelNew,
//       }
//     }

//     case 'RematchAccept': {
//       const result = rematchAccept(msg[1], model)

//       if (isErr(result)) {
//         return {
//           model,
//         }
//       }

//       return {
//         model: result.value,
//       }
//     }

//     case 'RematchAsk': {
//       const result = rematchAsk(msg[1], model)

//       if (isErr(result)) {
//         return {
//           model,
//         }
//       }

//       return {
//         model: result.value,
//       }
//     }

//     case 'RematchDecline': {
//       const result = rematchDecline(msg[1], model)

//       if (isErr(result)) {
//         return {
//           model,
//         }
//       }

//       return {
//         model: result.value,
//       }
//     }

//     case 'Rematch_Cancel': {
//       const result = rematchCancel(msg[1], model)

//       if (isErr(result)) {
//         return {
//           model,
//         }
//       }

//       return {
//         model: result.value,
//       }
//     }
//   }
// }

// export const updateFromEvent = ({
//   msg,
//   model,
// }: {
//   msg: Record<string, unknown>
//   model: Model
// }): {
//   model: Model
// } => {
//   if (msg.t === 'space-evt.user-left-space') {
//     const { userId } = msg

//     const player: PlayerType | 'none' = model.O === userId ? 'O' : model.X === userId ? 'X' : 'none'

//     if (player === 'none') {
//       return {
//         model,
//       }
//     }

//     const other = toOpposite(player)

//     const modelNew: Model = {
//       type: 'setup',
//       maxRoundCount: model.maxRoundCount,
//       moveTimeLimit: model.moveTimeLimit,
//       X: model.X,
//       O: model.O,
//       [player]: 'none',
//       [other]: model[other],
//     }

//     return {
//       model: modelNew,
//     }
//   }

//   return {
//     model,
//   }
// }

// //
// //
// //
// // Subscriptions
// //
// //
// //

// export const subscriptions = (intervalId: string, model: Model): Sub<Msg> => {
//   switch (model.type) {
//     case 'setup': {
//       return Sub.none()
//     }

//     case 'game-over': {
//       return Sub.none()
//     }

//     case 'game': {
//       const currentRound = Round.toCurrent(model.round)

//       switch (currentRound.type) {
//         case 'RoundStarted': {
//           const turn = toTurn(currentRound.board)
//           return Time.interval(
//             `${intervalId}-move-count-down-${turn}`,
//             TimeSpan.seconds(1),
//             (): Msg => ['MoveCountDown'],
//           )
//         }

//         case 'RoundStarting': {
//           return Time.interval(`${intervalId}-round-count-down`, TimeSpan.seconds(3 / 4), (): Msg => ['RoundCountDown'])
//         }

//         case 'RoundOver': {
//           return Sub.none()
//         }
//       }
//     }
//   }
// }
