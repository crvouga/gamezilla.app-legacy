import { Profile, SpaceId, UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { LamportClock } from "gamezilla/@SHARED/lamport-clock";
import * as Game from "./@CHILD/game/game.core";
import { WithEventMeta } from "./@SHARED/event";
import * as Space from "./spaces-core/space";
import { SpaceEvent } from "./spaces-state";

export type ToClient = ToClientExtra &
  (
    | {
        t: "event";
        c: WithEventMeta<SpaceEvent>;
        clock: LamportClock;
      }
    | {
        t: "sync";
        space: Space.Model;
      }
    | {
        t: "spaces-list";
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
        clock: LamportClock;
      }
    | {
        t: "sync";
        space: Space.Model;
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
