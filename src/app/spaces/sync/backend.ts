import { RPC } from '~/@/rpc'
import { Sub } from '~/@/sub'
import { SpaceBackendModule } from '../architecture/space-backend'
import { SpaceBackendCtxModule } from '../types'
import { rpcContract } from './types'

const update: SpaceBackendModule['update'] = async (_input) => {
  return SpaceBackendModule.andThen(
    {},
    // () => updateFromFrontend(input),
    // () => updateCurrentUserSpace(input),
    // () => sendMsgSpaceToFrontend(input),
    // () => outputMsgSpacesFromBackend(input),
  )
}

// const updateFromFrontend: SpaceBackendModule['update'] = async (input) => {
//   switch (input.msgFrontend?.t) {
//     case 'sync.sync': {
//       await input.ctx.spacesCore.merge(input.msgFrontend.space)

//       const spaceId = Space.toSpaceId(input.msgFrontend.space)

//       if (!spaceId) {
//         return {}
//       }

//       const spaceNew = unwrapOr(await input.ctx.spacesCore.get(spaceId), null)

//       if (!spaceNew) {
//         return {}
//       }

//       const profiles = await getAssociatedProfiles(input.ctx, [spaceNew])

//       const starting = EventSourced.startFromLatestSnapshot(spaceNew)

//       return {
//         msgCmd: [
//           sendToFrontend<MsgToFrontend>([input.msgFrontend.clientId], {
//             t: 'sync.synced',
//             causedBy: { msgFrontend: input.msgFrontend },
//             space: starting,
//             profilesByUserId: profiles,
//           }),
//         ],
//       }
//     }
//     default: {
//       return {}
//     }
//   }
// }

// const getAssociatedProfiles = async (ctx: AppBackendCtx, spaces: Space.Model[]) => {
//   const userIds = spaces.flatMap((space) => {
//     const state = EventSourced.toState(Space.config, space)
//     switch (state.type) {
//       case 'started':
//         return SpaceState.toUserIds(state)
//       default:
//         return []
//     }
//   })

//   const got = await ctx.userProfileDb.findByUserIds(userIds)

//   const profiles = unwrapOr(got, [])

//   return UserProfile.indexByUserId(profiles)
// }

// const updateCurrentUserSpace: SpaceBackendModule['update'] = async (input) => {
//   switch (input.msgEvt?.t) {
//     case 'auth-evt.client-authenticated': {
//       const space = unwrapOr(await input.ctx.spacesCore.getByUserId(input.msgEvt.user.userId), null)

//       if (!space) {
//         return {}
//       }

//       const profiles = await getAssociatedProfiles(input.ctx, [space])

//       const started = EventSourced.startFromLatestSnapshot(space)

//       return {
//         msgCmd: [
//           sendToFrontend<MsgToFrontend>([input.msgEvt.clientId], {
//             t: 'sync.synced',
//             space: started,
//             profilesByUserId: profiles,
//             currentUser: input.msgEvt.user,
//             causedBy: {
//               msgEvt: input.msgEvt,
//             },
//           }),
//         ],
//       }
//     }

//     default: {
//       return {}
//     }
//   }
// }

// const outputMsgSpacesFromBackend: SpaceBackendModule['update'] = (input) => {
//   switch (input.msgFrontend?.t) {
//     case 'sync.got-msg-space': {
//       return {
//         msgSpace: [input.msgFrontend.c],
//       }
//     }
//   }

//   return {}
// }

const subscriptions: SpaceBackendModule['subscriptions'] = (_input) => {
  return Sub.None
}

const rpc = (_input: { ctx: SpaceBackendCtxModule }) => {
  return RPC.initServer(rpcContract, {
    async sync(input) {
      return {
        space: input.space,
      }
    },
  })
}

export const SyncBackend = {
  update,
  subscriptions,
  rpc,
}
