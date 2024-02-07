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

export type ModelServer = Spaces.Model & {
  games: {
    [spaceId: SpaceId]: Game.ModelServer;
  };
  profileCache: {
    [userId: UserId]: Profile;
  };
};

export type ModelClient = Spaces.Model & {
  games: {
    [spaceId: SpaceId]: Game.ModelClient;
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

export type MsgServer =
  | { t: "event"; c: WithEventId<SpaceEvent> }
  | { t: "game"; spaceId: SpaceId; c: Game.MsgServer };

export type MsgClient =
  | { t: "event"; c: WithEventId<SpaceEvent> }
  | { t: "game"; spaceId: SpaceId; c: Game.MsgClient }
  | { t: "closed-modal" }
  | { t: "clicked-people-button" }
  | { t: "clicked-back-button"; from: "join-screen" }
  | { t: "clicked-space-card"; spaceId: SpaceId }
  | { t: "clicked-user"; userId: UserId }
  | { t: "clicked-link"; route: AppRoute };

export type MsgToClient = MsgToClientExtra &
  (
    | {
        t: "event";
        c: WithEventMeta<SpaceEvent>;
      }
    | {
        t: "listed-spaces";
        spaces: Space.Model[];
      }
    | {
        t: "synced";
        space: Space.Model;
      }
    | {
        t: "current-user-space";
        space: Space.Model;
      }
    | {
        t: "game";
        spaceId: SpaceId;
        c: Game.MsgToClient;
      }
  );

export type MsgToServer = MsgToServerExtra &
  (
    | {
        t: "event";
        c: WithEventMeta<SpaceEvent>;
      }
    | {
        t: "sync";
        space: Space.Model;
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
        c: Game.MsgToServer;
      }
  );

export type MsgToClientExtra = {
  profiles?: { [userId: UserId]: Profile };
  causedBy?: unknown;
  meta?: Record<string, unknown>;
};

export type MsgToServerExtra = {
  profiles?: { [userId: UserId]: Profile };
  meta?: Record<string, unknown>;
  causedBy?: unknown;
};
