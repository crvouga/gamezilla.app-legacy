// import { SpaceBackendCtx } from '~/app/spaces/@/backend/ctx'

// import { initShared, type ModelBackend, type MsgBackend, type MsgToBackend } from './vs-user.types'
// import { Eff } from '~/@/eff'
// import { Sub } from '~/@/sub'

// //
// //
// //
// // model
// //
// //
// //

// export type Model = ModelBackend

// export const init = initShared

// //
// //
// //
// // update
// //
// //
// //

// export type Msg = MsgBackend

// export const update = ({
//   model,
// }: {
//   msg: Msg
//   model: Model
// }): {
//   model: Model
//   eff?: Eff<Msg>
// } => {
//   return { model }
// }

// export const updateFromFrontend = ({
//   model,
// }: {
//   ctx: SpaceBackendCtx
//   msg: MsgToBackend
//   model: Model
// }): {
//   model: Model
//   eff?: Eff<Msg>
// } => {
//   return { model }
// }

// export const updateFromEvent = ({
//   msg,
//   model,
// }: {
//   msg: Record<string, unknown>
//   model: Model
// }): {
//   model: Model
//   eff?: Eff<Msg>
// } => {
//   if (msg.t === 'space-evt.userLeftSpace') {
//     return { model: init(model) }
//   }

//   return { model }
// }

// //
// //
// //
// // subscriptions
// //
// //
// //

// export const subscriptions = (_model: Model): Sub<Msg> => {
//   return Sub.none()
// }
