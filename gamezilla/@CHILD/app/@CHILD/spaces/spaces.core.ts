import { Profile, SpaceId, UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { AppRoute } from "../../@SHARED/client";
import * as Game from "./@CHILD/game/game.core";
import { WithEventId, WithEventMeta } from "./@SHARED/event";
import * as Space from "./spaces-core/space";
import { SpaceEvent } from "./spaces-core/space-event";
import * as Spaces from "./spaces-core/spaces";

//
//
//
// Model
//
//
//

export type ServerModel = Spaces.Model & {
  games: {
    [spaceId: SpaceId]: Game.ServerModel;
  };
  profileCache: {
    [userId: UserId]: Profile;
  };
};

export type ClientModel = Spaces.Model & {
  games: {
    [spaceId: SpaceId]: Game.ClientModel;
  };
  previewUserId: UserId | null;
  modal: null | "user-preview" | "users";
  isFetchingSpaces: boolean;
};

//
//
//
// Msg
//
//
//

export type ServerMsg =
  | { t: "event"; c: WithEventId<SpaceEvent> }
  | { t: "game"; spaceId: SpaceId; c: Game.ServerMsg };

export type ClientMsg =
  | { t: "event"; c: WithEventId<SpaceEvent> }
  | { t: "game"; spaceId: SpaceId; c: Game.ClientMsg }
  | { t: "closed-modal" }
  | { t: "clicked-people-button" }
  | { t: "clicked-back-button"; from: "join-screen" }
  | { t: "clicked-space-card"; spaceId: SpaceId }
  | { t: "clicked-user"; userId: UserId }
  | { t: "clicked-link"; route: AppRoute };

export type ToClient = ToClientExtra &
  (
    | {
        t: "event";
        c: WithEventMeta<SpaceEvent>;
      }
    | {
        t: "spaces";
        spaces: Space.Model[];
      }
    | {
        t: "game";
        spaceId: SpaceId;
        c: Game.ToClient;
      }
  );

export type ToServer = ToServerExtra &
  (
    | {
        t: "event";
        c: WithEventMeta<SpaceEvent>;
      }
    | {
        t: "spaces";
        spaces: Space.Model[];
      }
    | {
        t: "list-spaces";
        limit: number;
        offset: number;
        where?: {
          spaceId?: SpaceId;
        };
      }
    | {
        t: "game";
        spaceId: SpaceId;
        c: Game.ToServer;
      }
  );

export type ToClientExtra = {
  profiles?: { [userId: UserId]: Profile };
  causedBy?: unknown;
  meta?: Record<string, unknown>;
};

export type ToServerExtra = {
  profiles?: { [userId: UserId]: Profile };
  meta?: Record<string, unknown>;
};
