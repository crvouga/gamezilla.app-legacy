import { type RemoteResult, Result } from '~/@/result'
import type { MicLoadResult, MicUnloadResult } from './mic'
import { dissoc } from '~/@/object/dissoc'
import { filterObject } from '~/@/object/filter-object'
import { PartyId } from '../@/data/party-id'
import { UserId } from '../@/data/user-id'
const { Err, Ok } = Result

//
//
//
// Model
//
//
//

export type CoreModel = {
  parties: {
    [partyId: PartyId]: {
      partyId: PartyId
      hostId: UserId
    }
  }
  users: {
    [userId: UserId]: {
      userId: UserId
      partyId: PartyId
    }
  }
}

export type ModelBackend = CoreModel

export type ModelFrontend = CoreModel & {
  volume: number
  requests: {
    [key in Req[0]]?: RemoteResult<Problem, null>
  }
}

//
//
//
// Msg
//
//
//

export type MsgBackend = ['none']

export type MsgFrontend =
  | Req
  | ['clicked-banner']
  | ['MicSound', { volume: number }]
  | ['MicLoad', MicLoadResult]
  | ['MicUnload', MicUnloadResult]

export type MsgToBackend = Req

export type MsgToFrontend = Res

//
//
//
// Req/Res
//
//
//

export type Req =
  | ['party-get', null]
  | ['PartyCreate', { userId: UserId; partyId: PartyId }]
  | ['PartyDestroy', { userId: UserId }]
  | ['PartyLeave', { userId: UserId }]
  | ['PartyJoin', { userId: UserId; partyId: PartyId }]

export type Res =
  | ['party-get', null, Result<Problem, CoreModel>]
  | [
      'PartyCreate',
      {
        userId: UserId
        partyId: PartyId
      },
      Result<Problem, CoreModel>,
    ]
  | [
      'PartyDestroy',
      {
        userId: UserId
      },
      Result<Problem, CoreModel>,
    ]
  | [
      'PartyLeave',
      {
        userId: UserId
      },
      Result<Problem, CoreModel>,
    ]
  | [
      'PartyJoin',
      {
        userId: UserId
        partyId: PartyId
      },
      Result<Problem, CoreModel>,
    ]

type Problem =
  | 'must_not_be_in_party'
  | 'must_be_in_party'
  | 'must_be_host'
  | 'party_must_exist'
  | 'must_not_be_host'
  | 'user_not_found'
  | 'party_not_found'

export const handle = (msg: Req, model: CoreModel): Result<Problem, CoreModel> => {
  switch (msg[0]) {
    case 'party-get': {
      return Ok(model)
    }

    case 'PartyCreate': {
      const { partyId, userId } = msg[1]

      const user = model.users[userId]

      if (user) {
        return Err('must_not_be_in_party')
      }

      const modelNew: CoreModel = {
        ...model,
        users: {
          ...model.users,
          [userId]: {
            partyId,
            userId,
          },
        },
        parties: {
          ...model.parties,
          [partyId]: {
            hostId: userId,
            partyId,
          },
        },
      }

      return Ok(modelNew)
    }

    case 'PartyDestroy': {
      const { userId } = msg[1]

      const user = model.users[userId]

      if (!user) {
        return Err('user_not_found')
      }

      const party = model.parties[user.partyId]

      if (!party) {
        return Err('party_not_found')
      }

      if (party.hostId !== userId) {
        return Err('must_be_host')
      }

      const modelNew: CoreModel = {
        parties: dissoc(model.parties, user.partyId),
        users: filterObject(model.users, (entry) => entry[1].partyId !== user.partyId),
      }

      return Ok(modelNew)
    }

    case 'PartyJoin': {
      const { userId, partyId } = msg[1]

      const user = model.users[userId]

      if (user) {
        return Err('must_not_be_in_party')
      }

      const party = model.parties[partyId]

      if (!party) {
        return Err('party_must_exist')
      }

      const modelNew: CoreModel = {
        ...model,
        users: {
          ...model.users,
          [userId]: {
            userId,
            partyId,
          },
        },
      }

      return Ok(modelNew)
    }

    case 'PartyLeave': {
      const { userId } = msg[1]

      const user = model.users[userId]

      if (!user) {
        return Err('must_be_in_party')
      }

      const party = model.parties[user.partyId]

      if (!party) {
        return Err('must_be_in_party')
      }

      if (party.hostId === userId) {
        return Err('must_not_be_host')
      }

      const modelNew: CoreModel = {
        parties: model.parties,
        users: dissoc(model.users, userId),
      }

      return Ok(modelNew)
    }
  }
}
