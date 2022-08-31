import { UserId, PartyId } from "../Data"

export type BackendModel = {
  parties: {
    [partyId: PartyId.PartyId]: Party
  }
  users: {}
}

export type Party = {
  partyId: PartyId.PartyId
  hostId: UserId.UserId
}
