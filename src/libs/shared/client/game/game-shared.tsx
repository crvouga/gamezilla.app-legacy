import { GameSpaceId, UserId } from "@gamezilla/shared/app";
import { VDom, cn } from "@gamezilla/shared/ui";
import { Ctx, ViewCtx } from "../ctx";

export type SpaceCtx = Ctx & {
  hostId: UserId;
};

export type Space = {
  hostId: UserId;
  spaceId: GameSpaceId;
  users: {
    [userId: UserId]: UserId;
  };
};

export type SpaceViewCtx = ViewCtx & {
  onQuit: () => void;
  onViewProfile: (input: { userId: UserId }) => void;
  hostId: UserId;
  space: Space;
};

export type SpaceMsg =
  | { t: "user-left"; userId: UserId }
  | { t: "user-joined"; userId: UserId };

export const bannerArtAspectRatio = Math.pow(3 / 4, 4);

export const GameLayout = ({
  children,
  isSpectating,
  className,
}: {
  className?: string;
  isSpectating?: boolean;
  children?: VDom;
}) => {
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col items-center justify-center overflow-y-auto",
        isSpectating && "border-8 border-t-0 border-blue-500",
        className
      )}>
      {isSpectating && (
        <div className="flex w-full items-center justify-center bg-blue-500 py-1 text-sm font-semibold text-white">
          You are spectating
        </div>
      )}
      {children}
    </div>
  );
};
