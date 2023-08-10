import { UserId } from "gamezilla/app/@/app";
import { SpaceId } from "../space-id";
import { ClientCtx, ViewCtx } from "gamezilla/app/@/client";

export type SpaceClientCtx = ClientCtx & {
  hostId: UserId;
};

export type SpaceViewCtx = ViewCtx & {
  onQuit: () => void;
  onViewProfile: (input: { userId: UserId }) => void;
  hostId: UserId;
  spaceId: SpaceId;
};
