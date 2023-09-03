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
  requests: {
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

export type ToClientExtra = {
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
  | { t: "destroy"; userId: UserId; spaceId: SpaceId }
  | { t: "join"; userId: UserId; spaceId: SpaceId }
  | { t: "leave"; userId: UserId; spaceId: SpaceId }
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
      spaceId: SpaceId;
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
      spaceId: SpaceId;
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

export const toSpaceByUserId = (model: ClientModel, userId: UserId) => {
  const spaceId = model.indexUserId[userId];
  if (!spaceId) {
    return null;
  }
  const space = model.spaces[spaceId];
  if (!space) {
    return null;
  }
  return space;
};
