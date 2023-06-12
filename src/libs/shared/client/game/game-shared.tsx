import { UserId } from "@gamezilla/shared/app";
import {
  Box,
  Button,
  FillBox,
  Icons,
  Typography,
  ViewNode,
  avatar,
  box,
  cn,
  text,
} from "@gamezilla/shared/ui";
import { Ctx, ViewCtx } from "../ctx";

export type RoomCtx = Ctx & {
  hostId: UserId;
};

export type RoomViewCtx = ViewCtx & {
  onQuit: () => void;
  hostId: UserId;
};

export type RoomMsg =
  | { t: "user-left"; userId: UserId }
  | { t: "user-joined"; userId: UserId };

export const bannerArtAspectRatio = Math.pow(3 / 4, 4);

export const ViewGameBox = ({
  children,
  isSpectating,
}: {
  isSpectating?: boolean;
  children?: ViewNode;
}) => {
  return (
    <div
      className={cn(
        "w-full h-full flex flex-col items-center justify-center overflow-y-auto",
        isSpectating && "border-4 border-blue-500 border-t-0"
      )}>
      {isSpectating && (
        <div className="bg-blue-500 flex items-center justify-center font-semibold py-1 text-white text-sm w-full">
          You are spectating
        </div>
      )}
      {children}
    </div>
  );
};

export const viewSelectModeScreen = ({
  ctx,
  title,
  coverArt,
  onUserVsComputer,
  onVsUser,
  gameRoomCtx,
}: {
  gameRoomCtx: RoomViewCtx;
  ctx: ViewCtx;
  title: string;
  coverArt: ViewNode;
  onVsUser: () => void;
  onUserVsComputer: () => void;
}) => {
  if (ctx.currentUserId !== gameRoomCtx.hostId) {
    return (
      <FillBox
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
        <Box
          sx={{
            height: 100,
            width: 100,
            mx: "auto",
            borderRadius: 2,
            overflow: "hidden",
            mb: 1,
          }}>
          {coverArt}
        </Box>

        <Typography variant="h2" align="center" sx={{ mb: 1 }}>
          {title}
        </Typography>

        <Typography variant="subtitle2" color="text.secondary" align="center">
          Host is selecting the mode
        </Typography>
      </FillBox>
    );
  }

  return (
    <FillBox sx={{ p: 2 }}>
      <Box
        sx={{
          height: 100,
          width: 100,
          mx: "auto",
          borderRadius: 2,
          overflow: "hidden",
          mt: 4,
          mb: 2,
        }}>
        {coverArt}
      </Box>

      <Typography variant="h2" align="center" sx={{ mb: 1 }}>
        {title}
      </Typography>

      <Typography
        variant="subtitle2"
        color="text.secondary"
        align="center"
        sx={{ mb: 2 }}>
        Select Mode
      </Typography>

      <Button
        onClick={onVsUser}
        size="large"
        fullWidth
        variant="outlined"
        startIcon={<Icons.PeopleAlt />}
        sx={{ mb: 2 }}>
        Play Online
      </Button>

      <Button
        onClick={onUserVsComputer}
        size="large"
        fullWidth
        variant="outlined"
        startIcon={<Icons.SmartToy />}>
        Play Computer
      </Button>

      <Box sx={{ flex: 1 }} />

      <Button
        onClick={gameRoomCtx.onQuit}
        size="large"
        fullWidth
        variant="outlined"
        startIcon={<Icons.ArrowLeft />}>
        Back
      </Button>
    </FillBox>
  );
};

export const viewUserPlayerSlot = ({
  ctx,
  userId,
}: {
  userId: UserId;
  ctx: ViewCtx;
}) => {
  return box(
    {
      display: "flex",
      alignItems: "center",
      gap: 1,
      flex: 1,
      overflow: "hidden",
    },
    [
      avatar({
        width: 32,
        height: 32,
        mr: 1,
        src: ctx.profiles[userId]?.avatarUrl,
      }),
      text({ noWrap: true }, [ctx.profiles[userId]?.username]),
    ]
  );
};

export const viewUserPlayerSlotBar = ({
  ctx,
  left,
  right,
}: {
  left: UserId;
  right: UserId;
  ctx: ViewCtx;
}) => {
  return box(
    {
      p: 2,
      width: "100%",
      display: "flex",
      alignItems: "center",
      gap: 1,
      flex: 1,
      overflow: "hidden",
    },
    [
      viewUserPlayerSlot({ ctx, userId: left }),
      viewUserPlayerSlot({ ctx, userId: right }),
    ]
  );
};

export type BottomBarButtonAction = {
  label: string;
  disabled?: boolean;
  icon: ViewNode;
  onClick: () => void;
  color?: "danger" | "success" | "inherit";
};

export const ViewBottomButtonBar = ({
  actions,
}: {
  actions: BottomBarButtonAction[];
}) => {
  return (
    <div className="flex items-center border-t border-neutral-700 w-full">
      {actions.map(({ label, disabled, icon, onClick, color = "default" }) => (
        <button
          disabled={disabled}
          key={label}
          onClick={onClick}
          className={cn(
            "flex-1 flex flex-col p-1 gap-0.5 text-sm items-center active:opacity-50",
            disabled && "opacity-50",
            color === "danger" && "text-red-500",
            color === "success" && "text-green-500",
            color === "default" && "text-inherit"
          )}>
          {icon}
          <p className="text-xs">{label}</p>
        </button>
      ))}
    </div>
  );
};
