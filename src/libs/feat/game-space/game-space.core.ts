import { RemoteResult, Result } from "@gamezilla/core";
import { GameSpaceId, UserId } from "@gamezilla/shared/app";
import { GameSpace } from "@gamezilla/shared/game-space";
import * as Game from "./game/game.core";

//
//
//
// Model
//
//
//

export type ServerModel = null;

export type ClientModel = {
  spaces: {
    [spaceId: GameSpaceId]: GameSpace<Game.ClientModel>;
  };
  req: {
    [key in Req["t"]]?: RemoteResult<string, null>;
  };
  previewUserId: UserId | null;
  modal: ModalModel;
};

export const findSpaceByUserId = (model: ClientModel, userId: UserId) => {
  for (const spaceId in model.spaces) {
    if (!GameSpaceId.is(spaceId)) {
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

type ModalModel = null | "user-preview" | "users";

export type GameSpaceUser = {
  userId: UserId;
  spaceId: GameSpaceId;
};

//
//
//
// Msg
//
//
//

export type ToClient = Res | { t: "game"; c: Game.ToClient };

export type ToServer = Req | { t: "game"; c: Game.ToServer };

export type ServerMsg = { t: "game"; spaceId: GameSpaceId; c: Game.ServerMsg };

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
  | { t: "create"; spaceId: GameSpaceId }
  | { t: "destroy"; userId: UserId }
  | { t: "join"; userId: UserId; spaceId: GameSpaceId }
  | { t: "leave"; userId: UserId }
  | { t: "input-game"; gameName?: Game.GameName | null };

export type Res =
  | {
      t: "create";
      spaceId: GameSpaceId;
      result: Result<string, GameSpace<Game.ServerModel>>;
    }
  | {
      t: "destroy";
      userId: UserId;
      result: Result<string, GameSpace<Game.ServerModel>>;
    }
  | {
      t: "join";
      userId: UserId;
      spaceId: GameSpaceId;
      result: Result<string, GameSpace<Game.ServerModel>>;
      game?: Game.ServerModel;
    }
  | {
      t: "leave";
      userId: UserId;
      result: Result<string, GameSpace<Game.ServerModel>>;
    }
  | {
      t: "input-game";
      gameName?: Game.GameName | null;
      result: Result<string, GameSpace<Game.ServerModel>>;
    }
  | {
      t: "list";
      result: Result<string, GameSpace<Game.ServerModel>[]>;
    };
