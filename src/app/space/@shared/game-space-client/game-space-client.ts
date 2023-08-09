import { UserId } from "src/app/@shared/app";
import { SpaceId } from "../../space-id";
import { ClientCtx, ViewCtx } from "src/app/@shared/client";

export type SpaceClientCtx = ClientCtx & {
  hostId: UserId;
};

export type SpaceViewCtx = ViewCtx & {
  onQuit: () => void;
  onViewProfile: (input: { userId: UserId }) => void;
  hostId: UserId;
  spaceId: SpaceId;
};
