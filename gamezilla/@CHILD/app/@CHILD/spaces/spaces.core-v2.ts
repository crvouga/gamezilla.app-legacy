import { Profile, SpaceId, UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { LamportClock } from "gamezilla/@SHARED/lamport-clock";
import * as Game from "./@CHILD/game/game.core";
import { EventId, WithEventMeta } from "./@SHARED/event";
import { SpaceEvent, State, StateSpace } from "./spaces-state";

//
//
//
//
//
//
//
//

type SpaceModel = {
  events: WithEventMeta<SpaceEvent>[];
  clock: LamportClock;
  snapshots: {
    [eventId: EventId]: StateSpace;
  };
};

type CoreModelV2 = {
  spaces: {
    [spaceId: SpaceId]: SpaceModel;
  };
  spaceIdByUserId: {
    [userId: UserId]: SpaceId;
  };
};

export type ServerModelV2 = CoreModelV2 & {
  games: {
    [spaceId: SpaceId]: Game.ServerModel;
  };
  profileCache: {
    [userId: UserId]: Profile;
  };
};

export type ClientModelV2 = CoreModelV2 & {
  games: {
    [spaceId: SpaceId]: Game.ClientModel;
  };
  latestState: State;
  isSyncing: boolean;
  previewUserId: UserId | null;
  modal: Modal;
};

type Modal = null | "user-preview" | "users";
