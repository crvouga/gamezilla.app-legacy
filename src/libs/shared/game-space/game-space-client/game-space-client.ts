import { UserId } from "@gamezilla/shared/app";
import { ClientCtx, ViewCtx } from "@gamezilla/shared/client";
import { GameSpace } from "../game-space-core";

export type GameSpaceClientCtx = ClientCtx & {
  hostId: UserId;
};

export type GameSpaceViewCtx = ViewCtx & {
  onQuit: () => void;
  onViewProfile: (input: { userId: UserId }) => void;
  hostId: UserId;
  space: GameSpace;
};
