import { Ctx, UserId } from '@gamezilla/shared';
import {
  avatar,
  Box,
  box,
  Button,
  FillBox,
  Icons,
  text,
  Typography,
  ViewNode,
} from '@gamezilla/shared/ui';

export type GameRoomCtx = {
  onQuit: () => void;
  hostId: UserId;
};

export type SharedMsg = ['user-left', { userId: UserId }];

export const bannerArtAspectRatio = Math.pow(3 / 4, 4);

export const viewSelectModeScreen = ({
  ctx,
  title,
  coverArt,
  onUserVsComputer,
  onVsUser,
  gameRoomCtx,
}: {
  gameRoomCtx: GameRoomCtx;
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
