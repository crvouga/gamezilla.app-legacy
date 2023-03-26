import { Ctx, UserId } from '@gamezilla/shared';
import {
  ActionButton,
  Avatar,
  Box,
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
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  ViewNode,
} from '@gamezilla/shared/ui';

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
  return (
    <FillBox sx={{ overflowY: 'scroll', pb: 2 }}>
      {viewVersusBlock({
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
        </>
      )}

      <Box sx={{ flex: 1, py: 2 }} />

      <Box sx={{ px: 2, gap: 2, mt: 2, display: 'flex' }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Icons.ArrowLeft />}
          onClick={onCancel}
        >
          Back
        </Button>
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
    </FillBox>
  );
};

const viewVersusBlock = <PlayerType,>({
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
          <Icons.QuestionMark />
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

type GameOver<PlayerType> =
  | {
      type: 'winner';
      winner: PlayerType;
    }
  | {
      type: 'draw';
    }
  | {
      type: 'none';
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
  viewPlayerIcon,
  viewBoard,
  gameOver,
  gameOverActions,
}: {
  gameOver: GameOver<PlayerType>;
  turn: PlayerType;
  botPlayer: PlayerType;
  botName: string;
  userPlayer: PlayerType;
  leftPlayer: PlayerType;
  playerUserId: UserId;
  ctx: Ctx;
  actions: [string, IconName, () => void][];
  gameOverActions: [string, IconName, () => void][];
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

  const notTurnSx: Sx = {
    borderBottomWidth: 2,
    borderBottomStyle: 'solid',
    borderBottomColor: '#343434',
  };

  const botSlot = (
    <Paper
      key={botName}
      variant="outlined"
      sx={{
        display: 'flex',
        variant: 'outlined',
        flexWrap: 'wrap',
        alignItems: 'center',
        p: 1,
        flex: 1,
        overflow: 'hidden',
        ...(turn === botPlayer && gameOver.type === 'none'
          ? turnSx
          : notTurnSx),
      }}
    >
      {viewPlayerIcon({ playerType: botPlayer, sx: { ...iconSize, mr: 1 } })}
      {icon('smart-toy', { ...iconSize, mr: 1 })}
      <Typography noWrap={true} flex={1}>
        {botName}
      </Typography>
      {turn === botPlayer && gameOver.type === 'none' && (
        <CircularProgress size={24} sx={{ ml: 1 }} />
      )}
    </Paper>
  );

  const userSlot = (
    <Paper
      variant="outlined"
      sx={{
        display: 'flex',
        variant: 'outlined',
        alignItems: 'center',
        p: 1,
        flex: 1,
        overflow: 'hidden',
        ...(turn === userPlayer && gameOver.type === 'none'
          ? turnSx
          : notTurnSx),
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

  const feedback =
    gameOver.type !== 'none'
      ? fragment(['Game Over'])
      : fragment([
          viewPlayerIcon({
            playerType: turn,
            sx: { width: '1rem', height: '1rem', mr: 1 / 2 },
          }),
          turn === userPlayer && !isSpectating ? 'Your Turn' : 'Turn',
        ]);

  const sx: Sx = isSpectating
    ? {
        // borderStyle: 'solid',
        // borderWidth: 4,
        // borderColor: 'primary.main',
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
    ...(gameOver.type !== 'none' ? {} : { display: 'none' }),
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
        {/* <Fade in={gameOver.type !== 'none'}> */}
        <Box sx={overlaySx}>
          {viewGameOverMessage({
            viewPlayerIcon,
            gameOver,
          })}
        </Box>
        {/* </Fade> */}
      </Box>

      {gameOver.type !== 'none' && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
          {gameOverActions.map(([label, iconName, onPress]) => {
            return (
              <Button
                key={label}
                startIcon={icon(iconName)}
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                onClick={onPress}
              >
                {label}
              </Button>
            );
          })}
        </Box>
      )}

      <Box flex={1} />

      {!isSpectating && gameOver.type === 'none' && (
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

const viewGameOverMessage = <PlayerType,>({
  gameOver,
  viewPlayerIcon,
}: {
  gameOver: GameOver<PlayerType>;
  viewPlayerIcon: (props: { playerType: PlayerType; sx: Sx }) => ViewNode;
}) => {
  if (gameOver.type === 'draw') {
    return <Typography variant="h1">Draw</Typography>;
  }

  if (gameOver.type === 'winner') {
    return (
      <Typography
        variant="h1"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          fontSize: '4rem',
        }}
      >
        {viewPlayerIcon({
          sx: {
            width: '4rem',
            height: '4rem',
          },
          playerType: gameOver.winner,
        })}
        Won
      </Typography>
    );
  }

  return <Typography variant="h1">Game Over</Typography>;
};
