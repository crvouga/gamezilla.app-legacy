import { GameSpaceId, UserId } from "@gamezilla/shared/app";
import { ClientCtx, ViewCtx } from "@gamezilla/shared/client";

export type ClientGameSpaceCtx = ClientCtx & {
  hostId: UserId;
};

export type Space = {
  hostId: UserId;
  spaceId: GameSpaceId;
  users: {
    [userId: UserId]: UserId;
  };
};

export type ClientGameSpaceViewCtx = ViewCtx & {
  onQuit: () => void;
  onViewProfile: (input: { userId: UserId }) => void;
  hostId: UserId;
  space: Space;
};

export type ClientGameSpaceMsg =
  | { t: "user-left"; userId: UserId }
  | { t: "user-joined"; userId: UserId };
