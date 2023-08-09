import { UserId } from "@gamezilla/shared/app";
import { SpaceId } from "../../space-id";
import { ClientCtx, ViewCtx } from "@gamezilla/shared/client";

export type SpaceClientCtx = ClientCtx & {
  hostId: UserId;
};

export type SpaceViewCtx = ViewCtx & {
  onQuit: () => void;
  onViewProfile: (input: { userId: UserId }) => void;
  hostId: UserId;
  spaceId: SpaceId;
};
