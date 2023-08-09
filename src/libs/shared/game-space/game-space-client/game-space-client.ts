import { GameSpaceId, UserId } from "@gamezilla/shared/app";
import { ClientCtx, ViewCtx } from "@gamezilla/shared/client";

export type GameSpaceClientCtx = ClientCtx & {
  hostId: UserId;
};

export type GameSpaceViewCtx = ViewCtx & {
  onQuit: () => void;
  onViewProfile: (input: { userId: UserId }) => void;
  hostId: UserId;
  gameSpaceId: GameSpaceId;
};
