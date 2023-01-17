import { filterObject, RemoteData, removeKey, Result } from "@gamezilla/core"
import { PartyId, UserId } from "@gamezilla/data"
import { MicLoadResult, MicUnloadResult } from "./Mic"
const { Err, Ok } = Result

//
//
//
// Model
//
//
//

export type SharedModel = {
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

export type BackendModel = SharedModel

export type FrontendModel = SharedModel & {
  volume: number
  requests: {
    [key in Req[0]]?: RemoteData<Problem, null>
  }
}

//
//
//
// Msg
//
//
//

export type BackendMsg = ["none"]

export type FrontendMsg =
  | Req
  | ["ClickedBanner"]
  | ["MicSound", { volume: number }]
  | ["MicLoad", MicLoadResult]
  | ["MicUnload", MicUnloadResult]

export type ToBackend = Req

export type ToFrontend = Res

//
//
//
// Req/Res
//
//
//

export type Req =
  | ["PartyGet", null]
  | ["PartyCreate", { userId: UserId; partyId: PartyId }]
  | ["PartyDestroy", { userId: UserId }]
  | ["PartyLeave", { userId: UserId }]
  | ["PartyJoin", { userId: UserId; partyId: PartyId }]

export type Res =
  | ["PartyGet", null, Result<Problem, SharedModel>]
  | [
    "PartyCreate",
    { userId: UserId; partyId: PartyId },
    Result<Problem, SharedModel>,
  ]
  | ["PartyDestroy", { userId: UserId }, Result<Problem, SharedModel>]
  | ["PartyLeave", { userId: UserId }, Result<Problem, SharedModel>]
  | [
    "PartyJoin",
    { userId: UserId; partyId: PartyId },
    Result<Problem, SharedModel>,
  ]

type Problem =
  | "must_not_be_in_party"
  | "must_be_in_party"
  | "must_be_host"
  | "party_must_exist"
  | "must_not_be_host"
  | "user_not_found"
  | "party_not_found"

export const handle = (
  msg: Req,
  model: SharedModel,
): Result<Problem, SharedModel> => {
  switch (msg[0]) {
    case "PartyGet": {
      return Ok(model)
    }

    case "PartyCreate": {
      const { partyId, userId } = msg[1]

      const user = model.users[userId]

      if (user) {
        return Err("must_not_be_in_party")
      }

      const modelNew: SharedModel = {
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

    case "PartyDestroy": {
      const { userId } = msg[1]

      const user = model.users[userId]

      if (!user) {
        return Err("user_not_found")
      }

      const party = model.parties[user.partyId]

      if (!party) {
        return Err("party_not_found")
      }

      if (party.hostId !== userId) {
        return Err("must_be_host")
      }

      const modelNew: SharedModel = {
        parties: removeKey(user.partyId, model.parties),
        users: filterObject(
          model.users,
          (entry) => entry[1].partyId !== user.partyId,
        ),
      }

      return Ok(modelNew)
    }

    case "PartyJoin": {
      const { userId, partyId } = msg[1]

      const user = model.users[userId]

      if (user) {
        return Err("must_not_be_in_party")
      }

      const party = model.parties[partyId]

      if (!party) {
        return Err("party_must_exist")
      }

      const modelNew: SharedModel = {
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

    case "PartyLeave": {
      const { userId } = msg[1]

      const user = model.users[userId]

      if (!user) {
        return Err("must_be_in_party")
      }

      const party = model.parties[user.partyId]

      if (!party) {
        return Err("must_be_in_party")
      }

      if (party.hostId === userId) {
        return Err("must_not_be_host")
      }

      const modelNew: SharedModel = {
        parties: model.parties,
        users: removeKey(userId, model.users),
      }

      return Ok(modelNew)
    }
  }
}
