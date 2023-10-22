import { RemoteResult, Result } from "gamezilla/@SHARED/core";
import { Profile, UserId } from "gamezilla/app/@SHARED/data";
import { Space } from "gamezilla/app/space/@SHARED";
import { SpaceId } from "../@SHARED/data/space-id";
import * as Game from "./game/game.core";
import { SpaceStoreInstance } from "./space-store";
import { EvtMeta } from "./@SHARED/evt";

//
//
//
// Model
//
//
//

export type ServerModel = {
  spaces: SpaceStoreInstance;
};

export type ClientModel = {
  evtsBySpaceId: {
    [spaceId: SpaceId]: Evt & EvtMeta;
  };
  spaces: {
    [spaceId: SpaceId]: Space<Game.ClientModel>;
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

export type ToClient = ToClientExtra &
  (Res | { t: "game"; spaceId: SpaceId; c: Game.ToClient });

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
  | { t: "clicked-user"; userId: UserId };

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
  | {
      t: "input-game";
      userId: UserId;
      spaceId: SpaceId;
      gameName?: Game.GameName | null;
    };

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
      userId: UserId;
      spaceId: SpaceId;
      gameName?: Game.GameName | null;
      result: Result<string, Space<Game.ServerModel>>;
    }
  | {
      t: "list";
      result: Result<string, Space<Game.ServerModel>[]>;
    };

export const toSpaceByUserId = (model: ClientModel, userId: UserId) => {
  for (const spaceId in model.spaces) {
    if (!SpaceId.is(spaceId)) {
      continue;
    }

    const space = model.spaces[spaceId];

    if (space?.users[userId]) {
      return space;
    }
  }
  return null;
};

type Evt =
  | {
      t: "user-created-space";
      userId: UserId;
      spaceId: SpaceId;
    }
  | {
      t: "user-ended-space";
      userId: UserId;
      spaceId: SpaceId;
    }
  | {
      t: "user-joined-space";
      userId: UserId;
      spaceId: SpaceId;
      profile?: Profile;
    }
  | {
      t: "user-left-space";
      userId: UserId;
      spaceId: SpaceId;
    }
  | {
      t: "user-inputted-game";
      userId: UserId;
      spaceId: SpaceId;
      game: Game.GameName | null;
    }
  | {
      t: "game";
      c: Game.Evt;
    };

export type State = {
  visibility: "public" | "private";
  state: "started" | "ended";
  spaceId: SpaceId;
  hostId: UserId;
  users: {
    [userId: UserId]: UserId;
  };
  game: Game.State | null;
};

export const reducer = (state: State, evt: Evt & EvtMeta): State => {
  switch (evt.t) {
    case "user-created-space": {
      return {
        spaceId: evt.spaceId,
        hostId: evt.userId,
        visibility: "public",
        state: "started",
        users: {
          [evt.userId]: evt.userId,
        },
        game: null,
      };
    }

    case "user-ended-space": {
      return {
        ...state,
        state: "ended",
      };
    }

    case "user-inputted-game": {
      if (!evt.game) {
        return {
          ...state,
          game: null,
        };
      }
      return {
        ...state,
        game: Game.initState(evt.game),
      };
    }

    case "user-joined-space": {
      return {
        ...state,
        users: {
          ...state.users,
          [evt.userId]: evt.userId,
        },
      };
    }

    case "user-left-space": {
      return state;
    }

    case "game": {
      if (!state.game) {
        return state;
      }

      return {
        ...state,
        game: Game.reducer(state, state.game, { ...evt, ...evt.c }),
      };
    }
  }
};
