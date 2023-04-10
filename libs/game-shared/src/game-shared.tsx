import { Ctx, UserId } from '@gamezilla/shared';
import {
  avatar,
  Icon,
  Box,
  box,
  Button,
  FillBox,
  IconName,
  Icons,
  text,
  Typography,
  ViewNode,
  Sx,
  useTheme,
} from '@gamezilla/shared/ui';

export type RoomCtx = Ctx & {
  onQuit: () => void;
  hostId: UserId;
};

export type RoomMsg = { t: 'user-left'; userId: UserId };

export const bannerArtAspectRatio = Math.pow(3 / 4, 4);

export const ViewMainMenu = ({
  ctx,
  title,
  coverArt,
  actions,
  gameRoomCtx,
}: {
  gameRoomCtx: RoomCtx;
  ctx: Ctx;
  title: string;
  coverArt: ViewNode;
  actions: [IconName, string, () => void][];
}) => {
  if (ctx.currentUserId !== gameRoomCtx.hostId) {
    return (
      <div className="w-full h-full">
        <Box
          sx={{
            height: 120,
            width: 120,
            mx: 'auto',
            borderRadius: 2,
            overflow: 'hidden',
            mb: 1,
          }}
        >
          {coverArt}
        </Box>

        <Typography variant="h2" align="center" sx={{ mb: 1 }}>
          {title}
        </Typography>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full flex-1 flex flex-col items-center justify-center p-4 overflow-y-scroll">
        <div className="aspect-square w-32 h-32 max-w-full max-h-full  rounded mt-4">
          {coverArt}
        </div>

        <h1 className="text-4xl text-center mt-4 font-bold">{title}</h1>

        <div className="w-full flex flex-col gap-4 mt-4 mb-5">
          {actions.map(([iconName, label, onClick], index) => (
            <button
              key={index}
              onClick={onClick}
              className="btn w-full btn-primary"
            >
              <Icon name={iconName} className="mr-2" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        <button onClick={gameRoomCtx.onQuit} className="btn w-full">
          <Icons.ArrowLeft className="mr-2" />
          Back
        </button>
      </div>
    </div>
  );
};

export const ViewGameBox = ({
  sx,
  children,
  isSpectating,
}: {
  isSpectating?: boolean;
  sx?: Sx;
  children?: ViewNode;
}) => {
  const theme = useTheme();

  return (
    <FillBox
      sx={{
        ...sx,
        ...(isSpectating
          ? {
              border: `3px solid ${theme.palette.primary.main}`,
            }
          : {}),
      }}
    >
      {isSpectating && (
        <Typography
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: '#fff',
            textAlign: 'center',
            paddingY: 0.5,
          }}
        >
          You're Spectating
        </Typography>
      )}
      {children}
    </FillBox>
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
  gameRoomCtx: RoomCtx;
  ctx: Ctx;
  title: string;
  coverArt: ViewNode;
  onVsUser: () => void;
  onUserVsComputer: () => void;
}) => {
  if (ctx.currentUserId !== gameRoomCtx.hostId) {
    return (
      <FillBox
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Box
          sx={{
            height: 100,
            width: 100,
            mx: 'auto',
            borderRadius: 2,
            overflow: 'hidden',
            mb: 1,
          }}
        >
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
          mx: 'auto',
          borderRadius: 2,
          overflow: 'hidden',
          mt: 4,
          mb: 2,
        }}
      >
        {coverArt}
      </Box>

      <Typography variant="h2" align="center" sx={{ mb: 1 }}>
        {title}
      </Typography>

      <Typography
        variant="subtitle2"
        color="text.secondary"
        align="center"
        sx={{ mb: 2 }}
      >
        Select Mode
      </Typography>

      <Button
        onClick={onVsUser}
        size="large"
        fullWidth
        variant="outlined"
        startIcon={<Icons.PeopleAlt />}
        sx={{ mb: 2 }}
      >
        Play Online
      </Button>

      <Button
        onClick={onUserVsComputer}
        size="large"
        fullWidth
        variant="outlined"
        startIcon={<Icons.SmartToy />}
      >
        Play Computer
      </Button>

      <Box sx={{ flex: 1 }} />

      <Button
        onClick={gameRoomCtx.onQuit}
        size="large"
        fullWidth
        variant="outlined"
        startIcon={<Icons.ArrowLeft />}
      >
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
  ctx: Ctx;
}) => {
  return box(
    {
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      flex: 1,
      overflow: 'hidden',
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
  ctx: Ctx;
}) => {
  return box(
    {
      p: 2,
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      flex: 1,
      overflow: 'hidden',
    },
    [
      viewUserPlayerSlot({ ctx, userId: left }),
      viewUserPlayerSlot({ ctx, userId: right }),
    ]
  );
};
