import { ViewCtx, UserId } from '@gamezilla/shared';
import {
  Avatar,
  Box,
  Button,
  FillBox,
  Icons,
  Sx,
  Typography,
  ViewNode,
} from '@gamezilla/shared/ui';

export const viewVsUserSetupScreen = ({
  title,
  subtitle,
  coverArt,
  ctx,
  playerOne,
  playerTwo,
  onStartGame,
  onCancel,
}: {
  ctx: ViewCtx;
  title: string;
  subtitle: string;
  coverArt: ViewNode;
  playerOne: {
    label: string;
    userId: UserId | null;
    onStartPlaying: () => void;
    onStopPlaying: () => void;
    icon: (sx: Sx) => ViewNode;
  };
  playerTwo: {
    label: string;
    userId: UserId | null;
    onStartPlaying: () => void;
    onStopPlaying: () => void;
    icon: (sx: Sx) => ViewNode;
  };
  onStartGame: () => void;
  onCancel: () => void;
}) => {
  const isCurrentUserPlaying =
    ctx.currentUserId === playerOne.userId ||
    ctx.currentUserId === playerTwo.userId;

  return (
    <FillBox sx={{ overflowY: 'scroll', py: 2 }}>
      <Box
        sx={{
          height: 100,
          width: 100,
          minHeight: 100,
          minWidth: 100,
          mx: 'auto',
          borderRadius: 2,
          overflow: 'hidden',
          mt: 2,
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
        {subtitle}
      </Typography>

      {viewPlayerSlot({ ...playerOne, ctx })}

      {viewPlayerSlot({ ...playerTwo, ctx })}

      <Box sx={{ px: 2, mt: 4 }}>
        <Button
          disabled={
            !isCurrentUserPlaying || (!playerOne.userId && !playerTwo.userId)
          }
          fullWidth
          variant="contained"
          endIcon={<Icons.ArrowRight />}
          onClick={onStartGame}
        >
          Start Game
        </Button>
      </Box>

      <Box sx={{ flex: 1, py: 2 }} />

      <Box sx={{ px: 2, mt: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Icons.ArrowLeft />}
          onClick={onCancel}
        >
          Back
        </Button>
      </Box>
    </FillBox>
  );
};

const viewPlayerSlot = ({
  ctx,
  label,
  userId,
  icon,
  onStartPlaying,
  onStopPlaying,
}: {
  ctx: ViewCtx;
  label: string;
  userId: UserId | null;
  onStartPlaying: () => void;
  onStopPlaying: () => void;
  icon: (sx: Sx) => ViewNode;
}) => {
  const size: Sx = {
    width: 40,
    height: 40,
  };

  if (!userId) {
    return (
      <>
        <Typography sx={{ px: 2, mb: 1 }} color="text.secondary">
          {label}
        </Typography>
        <Box
          sx={{
            px: 2,
            mb: 2,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {icon({ ...size, mr: 1 })}
          <Button fullWidth variant="contained" onClick={onStartPlaying}>
            Play As {label}
          </Button>
        </Box>
      </>
    );
  }

  return (
    <>
      <Typography sx={{ px: 2, mb: 1 }} color="text.secondary">
        {label}
      </Typography>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 2,
          mb: 2,
        }}
      >
        {icon({ ...size, mr: 1 })}
        <Avatar
          sx={{ ...size, mr: 1 }}
          src={userId ? ctx.profiles[userId]?.avatarUrl : ''}
        />
        <Typography noWrap sx={{ flex: 1 }}>
          {userId ? ctx.profiles[userId]?.username ?? '...' : '...'}
        </Typography>
        {ctx.currentUserId === userId && (
          <Button onClick={onStopPlaying}>Stop Playing</Button>
        )}
      </Box>
    </>
  );
};
