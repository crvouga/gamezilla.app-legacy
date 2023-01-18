import { UserId } from '@gamezilla/shared';
import { Ctx } from '@gamezilla/shared';
import {
  ActionButton,
  avatar,
  Avatar,
  Box,
  box,
  Button,
  CircularProgress,
  Divider,
  FillBox,
  fragment,
  icon,
  IconName,
  Icons,
  Paper,
  Sx,
  text,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  ViewNode,
} from '@gamezilla/ui';

//
//
//
// Model
//
//
//

export type GameRoomCtx = {
  onQuit: () => void;
  hostId: UserId;
};

//
//
//
// View
//
//
//

export const bannerArtAspectRatio = Math.pow(3 / 4, 4);

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
  ctx: Ctx;
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
  ctx: Ctx;
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

export const viewVsBotVersusBlock = <PlayerType,>({
  playerId,
  botName,
  ctx,
  viewPlayerIcon,
  userPlayerType,
  botPlayerType,
  leftPlayerType,
}: {
  ctx: Ctx;
  botName: string;
  playerId: UserId | null;
  leftPlayerType: PlayerType;
  userPlayerType: PlayerType;
  botPlayerType: PlayerType;
  viewPlayerIcon: ({
    playerType,
    sx,
  }: {
    sx?: Sx;
    playerType: PlayerType;
  }) => ViewNode;
}) => {
  const iconSx: Sx = {
    width: 52,
    height: 52,
  };

  const playerTypeIconSx: Sx = {
    width: 52,
    height: 52,
  };

  const slotSx: Sx = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    overflow: 'hidden',
    width: '40%',
    px: 2,
  };

  const humanSlot = (
    <Box sx={slotSx}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
        {viewPlayerIcon({
          playerType: userPlayerType,
          sx: { ...playerTypeIconSx },
        })}
        <Avatar
          sx={iconSx}
          src={playerId ? ctx.profiles[playerId]?.avatarUrl : ''}
        >
          {/* <Icons.QuestionMark /> */}
        </Avatar>
      </Box>
      <Typography align="center" noWrap sx={{ width: '100%' }}>
        {playerId ? ctx.profiles[playerId]?.username ?? '...' : '?'}
      </Typography>
    </Box>
  );

  const botSlot = (
    <Box sx={slotSx}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
        {viewPlayerIcon({
          playerType: botPlayerType,
          sx: { ...playerTypeIconSx },
        })}
        <Icons.SmartToy sx={{ ...iconSx }} />
      </Box>
      <Typography align="center" noWrap>
        {botName}
      </Typography>
    </Box>
  );

  const leftSlot = leftPlayerType === userPlayerType ? humanSlot : botSlot;
  const rightSlot = leftPlayerType === userPlayerType ? botSlot : humanSlot;

  return (
    <Box
      sx={{ width: '100%', display: 'flex', alignItems: 'center', p: 2, py: 4 }}
    >
      {leftSlot}
      <Typography
        variant="h4"
        align="center"
        sx={{ px: 1, width: '20%', overflow: 'hidden' }}
      >
        vs
      </Typography>
      {rightSlot}
    </Box>
  );
};

export const viewVsBotSetupScreen = <BotLevel, PlayerType>({
  // title,
  // subtitle,
  // coverArt,
  leftPlayerType,
  ctx,
  playerId,
  botLevel,
  player,
  onStartGame,
  onCancel,
  onStopPlaying,
  onStartPlaying,
}: {
  ctx: Ctx;
  title: string;
  subtitle: string;
  coverArt: ViewNode;
  leftPlayerType: PlayerType;
  playerId: UserId | null;
  botLevel: {
    values: BotLevel[];
    selected: BotLevel;
    onInput: (value: BotLevel) => void;
  };
  player: {
    selected: PlayerType;
    values: PlayerType[];
    onInput: (value: PlayerType) => void;
    icon: (props: { sx?: Sx; playerType: PlayerType }) => ViewNode;
  };
  onCancel: () => void;
  onStartGame: () => void;
  onStartPlaying: () => void;
  onStopPlaying: () => void;
}) => {
  // const coverArtSize = 72
  return (
    <FillBox sx={{ overflowY: 'scroll', pb: 2 }}>
      {/* <Box sx={{ height: coverArtSize, width: coverArtSize, minHeight: coverArtSize, minWidth: coverArtSize, mx: 'auto', borderRadius: 2, overflow: "hidden", mt: 2, }}>
        {coverArt}
      </Box>
      <Typography variant="subtitle2" color="text.secondary" align="center" sx={{ mt: 1 }}>
        Vs Bot
      </Typography> */}
      {viewVsBotVersusBlock({
        viewPlayerIcon: ({ sx, playerType }) => player.icon({ sx, playerType }),
        playerId,
        botName: String(botLevel.selected),
        ctx,
        userPlayerType: player.selected,
        botPlayerType:
          player.values.find((p) => p !== player.selected) ?? player.selected,
        leftPlayerType: leftPlayerType,
      })}
      <Divider />
      {/* 

      <Typography variant="h2" align="center" sx={{ mb: 1 }} >
        {title}
      </Typography>

      <Typography variant="subtitle2" color="text.secondary" align="center" sx={{ mb: 2 }}>
        {subtitle}
      </Typography> 
      */}

      <Typography color="text.secondary" sx={{ mt: 2, px: 2, mb: 1 }}>
        Human
      </Typography>

      {playerId ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            px: 2,
            mb: 3,
          }}
        >
          <Avatar
            sx={{ mr: 1 }}
            src={playerId ? ctx.profiles[playerId]?.avatarUrl : ''}
          />
          <Typography noWrap sx={{ flex: 1 }}>
            {playerId ? ctx.profiles[playerId]?.username ?? '...' : '...'}
          </Typography>
          {ctx.currentUserId === playerId && (
            <Button onClick={onStopPlaying}>Stop Playing</Button>
          )}
        </Box>
      ) : (
        <Box
          sx={{
            px: 2,
            mb: 3,
          }}
        >
          <Button fullWidth variant="contained" onClick={onStartPlaying}>
            Start Playing
          </Button>
        </Box>
      )}

      {ctx.currentUserId === playerId && (
        <>
          <Typography color="text.secondary" sx={{ px: 2, mb: 1 }}>
            Computer
          </Typography>

          <Box
            sx={{
              width: '100%',
              px: 2,
              mb: 3,
            }}
          >
            <ToggleButtonGroup
              disabled={ctx.currentUserId !== playerId}
              fullWidth
              value={String(botLevel.selected)}
            >
              {botLevel.values.map((value) => (
                <ToggleButton
                  key={String(value)}
                  value={String(value)}
                  onClick={() => botLevel.onInput(value)}
                >
                  {String(value)}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          <Typography color="text.secondary" sx={{ px: 2, mb: 1 }}>
            Play As
          </Typography>

          <Box
            sx={{
              width: '100%',
              px: 2,
              mb: 3,
            }}
          >
            <ToggleButtonGroup
              disabled={ctx.currentUserId !== playerId}
              fullWidth
              value={String(player.selected)}
            >
              {player.values.map((value) => (
                <ToggleButton
                  key={String(value)}
                  value={String(value)}
                  onClick={() => player.onInput(value)}
                >
                  {player.icon({ playerType: value, sx: {} })}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          <Box sx={{ px: 2, mt: 2 }}>
            <Button
              disabled={ctx.currentUserId !== playerId}
              fullWidth
              variant="contained"
              endIcon={<Icons.ArrowRight />}
              onClick={onStartGame}
            >
              Start Game
            </Button>
          </Box>
        </>
      )}

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

export const viewVsBotGameScreen = <PlayerType,>({
  botPlayer,
  userPlayer,
  botName,
  playerUserId,
  ctx,
  leftPlayer,
  turn,
  actions,
  isGameOver,
  viewPlayerIcon,
  viewBoard,
}: {
  isGameOver: boolean;
  turn: PlayerType;
  botPlayer: PlayerType;
  botName: string;
  userPlayer: PlayerType;
  leftPlayer: PlayerType;
  playerUserId: UserId;
  ctx: Ctx;
  actions: [string, IconName, () => void][];
  viewPlayerIcon: (props: { playerType: PlayerType; sx: Sx }) => ViewNode;
  viewBoard: () => ViewNode;
}) => {
  const iconSize = {
    width: 24,
    height: 24,
  };

  const turnSx: Sx = {
    borderBottomWidth: 2,
    borderBottomStyle: 'solid',
    borderBottomColor: 'primary.main',
  };

  const botSlot = (
    <Paper
      key={botName}
      sx={{
        display: 'flex',
        variant: 'outlined',
        flexWrap: 'wrap',
        alignItems: 'center',
        p: 1,
        flex: 1,
        overflow: 'hidden',
        ...(turn === botPlayer && !isGameOver ? turnSx : {}),
      }}
    >
      {viewPlayerIcon({ playerType: botPlayer, sx: { ...iconSize, mr: 1 } })}
      {icon('smart-toy', { ...iconSize, mr: 1 })}
      <Typography noWrap={true} flex={1}>
        {botName}
      </Typography>
      {turn === botPlayer && !isGameOver && (
        <CircularProgress size={24} sx={{ ml: 1 }} />
      )}
    </Paper>
  );

  const userSlot = (
    <Paper
      sx={{
        display: 'flex',
        variant: 'outlined',
        alignItems: 'center',
        p: 1,
        flex: 1,
        overflow: 'hidden',
        ...(turn === userPlayer && !isGameOver ? turnSx : {}),
      }}
    >
      {viewPlayerIcon({ playerType: userPlayer, sx: { ...iconSize, mr: 1 } })}
      <Avatar
        sx={{ ...iconSize, mr: 1 }}
        src={ctx.profiles[playerUserId]?.avatarUrl}
      />
      <Typography noWrap={true}>
        {ctx.profiles[playerUserId]?.username}
      </Typography>
    </Paper>
  );

  const leftSlot = userPlayer === leftPlayer ? userSlot : botSlot;

  const rightSlot = userPlayer !== leftPlayer ? userSlot : botSlot;

  const isSpectating = ctx.currentUserId !== playerUserId;

  const feedback = isGameOver
    ? fragment(['Game Over'])
    : fragment([
        viewPlayerIcon({
          playerType: turn,
          sx: { width: 18, height: 18, mr: 1 / 2 },
        }),
        turn === userPlayer && !isSpectating ? 'Your Turn' : 'Turn',
      ]);

  const sx: Sx = isSpectating
    ? {
        borderStyle: 'solid',
        borderWidth: 4,
        borderColor: 'primary.main',
      }
    : {};

  const overlaySx: Sx = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    maxHeight: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.4)',
    // aspectRatio: "1",
    ...(isGameOver ? {} : { display: 'none' }),
  };

  return (
    <FillBox sx={sx}>
      {isSpectating && (
        <Typography
          sx={{ backgroundColor: 'primary.main' }}
          color="#fff"
          textAlign="center"
          variant="subtitle2"
        >
          Spectating
        </Typography>
      )}
      <Box
        px={1}
        pt={1}
        display="flex"
        gap={1}
        justifyContent="center"
        alignItems="center"
      >
        {leftSlot}
        {rightSlot}
      </Box>
      <Typography
        sx={{
          px: 2,
          pt: 1,
          pb: 1,
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {feedback}
      </Typography>

      <Box position="relative" display="flex">
        {viewBoard()}
        <Box sx={overlaySx}>
          <Typography variant="h1">Game Over</Typography>
        </Box>
      </Box>

      <Box flex={1} />

      {!isSpectating && (
        <Box display="flex" alignItems="center" width="100%">
          {actions.map(([label, iconName, onPress]) => (
            <ActionButton
              key={iconName}
              label={label}
              icon={icon(iconName)}
              onClick={onPress}
            />
          ))}
        </Box>
      )}
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

export const viewOverlay = (
  { open, ...sx }: { open?: boolean } & Sx,
  children: ViewNode[]
) => {
  if (!open) {
    return null;
  }

  return box(
    {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: '#fff',
      backgroundColor: 'rgba(0,0,0,0.66)',
      aspectRatio: '1',
      ...sx,
    },
    [children]
  );
};
