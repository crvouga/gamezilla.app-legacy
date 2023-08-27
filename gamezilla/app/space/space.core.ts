import { RemoteResult, Result } from "gamezilla/@SHARED/core";
import { UserId, Profile } from "gamezilla/app/@SHARED/data";
import { Space } from "gamezilla/app/space/@SHARED";
import * as Game from "./game/game.core";
import { SpaceId } from "../@SHARED/data/space-id";
import { SpaceStoreInstance } from "./space-store";

//
//
//
// Model
//
//
//

export type ServerModel = SpaceStoreInstance;

export type ClientModel = {
  spaces: {
    [spaceId: SpaceId]: Space<Game.ClientModel>;
  };
  indexUserId: {
    [userId: UserId]: SpaceId;
  };
  req: {
    [key in Req["t"]]?: RemoteResult<string, null>;
  };
  previewUserId: UserId | null;
  modal: ModalModel;
};

type ModalModel = null | "user-preview" | "users";

//
//
//
// Msg
//
//
//

export type ToClient = ToClientExtra & (Res | { t: "game"; c: Game.ToClient });

export type ToServer = ToServerExtra & (Req | { t: "game"; c: Game.ToServer });

type ToClientExtra = {
  profiles?: { [userId: UserId]: Profile };
};

type ToServerExtra = {
  profile?: Profile | null;
};

export type ServerMsg = { t: "game"; spaceId: SpaceId; c: Game.ServerMsg };

export type ClientMsg =
  | Req
  | { t: "game"; c: Game.ClientMsg }
  | { t: "modal-closed" }
  | { t: "modal-open"; c: ModalModel }
  | { t: "clicked-user"; userId: UserId }
  | { t: "clicked-user-link"; userId: UserId };

//
//
//
// Msg
//
//
//

export type Req =
  | { t: "list" }
  | { t: "create"; spaceId: SpaceId }
  | { t: "destroy"; userId: UserId }
  | { t: "join"; userId: UserId; spaceId: SpaceId }
  | { t: "leave"; userId: UserId }
  | { t: "input-game"; gameName?: Game.GameName | null };

export type Res =
  | {
      t: "create";
      spaceId: SpaceId;
      result: Result<string, Space<Game.ServerModel>>;
    }
  | {
      t: "destroy";
      userId: UserId;
      result: Result<string, Space<Game.ServerModel>>;
    }
  | {
      t: "join";
      userId: UserId;
      spaceId: SpaceId;
      result: Result<string, Space<Game.ServerModel>>;
      game?: Game.ServerModel;
    }
  | {
      t: "leave";
      userId: UserId;
      result: Result<string, Space<Game.ServerModel>>;
    }
  | {
      t: "input-game";
      gameName?: Game.GameName | null;
      result: Result<string, Space<Game.ServerModel>>;
    }
  | {
      t: "list";
      result: Result<string, Space<Game.ServerModel>[]>;
    };

export const findSpaceByUserId = (model: ClientModel, userId: UserId) => {
  for (const spaceId in model.spaces) {
    if (!SpaceId.is(spaceId)) {
      continue;
    }
    const space = model.spaces[spaceId];
    if (!space) {
      continue;
    }
    if (space.users[userId]) {
      return space;
    }
  }
  return null;
};

//
//
//
// Events
//
//
//

export type SpaceEventStore = {
  getSpaceIdByUserId: (userId: UserId) => Promise<SpaceId | null>;
  get: (spaceId: SpaceId) => Promise<Event[]>;
  append: (spaceId: SpaceId, event: Event) => Promise<null>;
};

export type Event =
  | { t: "user-left-space"; spaceId: SpaceId; userId: UserId }
  | { t: "user-joined-space"; spaceId: SpaceId; userId: UserId }
  | { t: "user-created-space"; spaceId: SpaceId; userId: UserId }
  | { t: "user-destroyed-space"; spaceId: SpaceId; userId: UserId }
  | {
      t: "user-inputted-game";
      userId: UserId;
      spaceId: SpaceId;
      gameName?: Game.GameName | null;
    };
