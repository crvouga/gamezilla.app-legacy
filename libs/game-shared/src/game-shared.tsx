import { Ctx, UserId } from '@gamezilla/shared';
import {
  Box,
  Button,
  FillBox,
  IconArrowLeftOnRect,
  Icons,
  MyButton,
  Sx,
  Typography,
  ViewNode,
  avatar,
  box,
  text,
  useTheme,
} from '@gamezilla/shared/ui';

export type RoomCtx = Ctx & {
  onQuit: () => void;
  hostId: UserId;
};

export type RoomMsg = { t: 'user-left'; userId: UserId };

export const bannerArtAspectRatio = Math.pow(3 / 4, 4);

export const ViewMainMenu = ({
  title,
  coverArt,
  buttons,
  roomCtx,
}: {
  roomCtx: RoomCtx;
  title: string;
  coverArt: ViewNode;
  buttons: { icon: ViewNode; label: string; onClick: () => void }[];
}) => {
  if (roomCtx.currentUserId !== roomCtx.hostId) {
    return (
      <div className="w-full h-full flex items-center justify-center flex-col">
        <div className="w-24 h-24 rounded overflow-hidden">{coverArt}</div>
        <p className="text-center text-3xl mt-3">{title}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col overflow-y-hidden">
      <div className="w-full flex-1 flex flex-col items-center justify-center px-4 py-8 overflow-y-auto">
        <div>
          <div className="w-32 h-32 rounded-md overflow-hidden">{coverArt}</div>
        </div>

        <h1 className="text-4xl font-bold mt-4">{title}</h1>

        <div className="w-full flex flex-col gap-6 mt-6">
          {buttons.map(({ icon, label, onClick }, index) => (
            <MyButton
              key={index}
              onClick={onClick}
              variant="contained"
              color="default"
              size="lg"
              className="w-full"
            >
              {icon}
              {label}
            </MyButton>
          ))}
        </div>
      </div>

      <div className="p-4 flex justify-center">
        <MyButton onClick={roomCtx.onQuit} size="lg" className="px-4">
          <IconArrowLeftOnRect />
          Quit
        </MyButton>
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
