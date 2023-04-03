import { UserId } from '@gamezilla/shared';
import { AuthenticatedRequestCtx, Ctx } from '@gamezilla/shared/backend';

export type RoomCtx = Ctx & {
  hostId: UserId;
};

export type RoomRequestCtx = RoomCtx & AuthenticatedRequestCtx;
