import { Ctx, UserId } from '@gamezilla/shared';
import {
  ActionButton,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Divider,
  FillBox,
  IconName,
  Icons,
  MyAvatar,
  MyButton,
  Paper,
  Sx,
  Typography,
  ViewNode,
  classNames,
  fragment,
  icon,
} from '@gamezilla/shared/ui';
import { ReactNode } from 'react';

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
    toName: (value: BotLevel) => string;
    render: (props: { botLevel: BotLevel }) => ReactNode;
  };
  player: {
    selected: PlayerType;
    values: PlayerType[];
    onInput: (value: PlayerType) => void;
    icon: (props: { sx?: Sx; playerType: PlayerType }) => ViewNode;
    toName: (value: PlayerType) => string;
    render: (props: { playerType: PlayerType }) => ReactNode;
  };
  onCancel: () => void;
  onStartGame: () => void;
  onStartPlaying: () => void;
  onStopPlaying: () => void;
}) => {
  return (
    <div className="w-full h-full flex-1 flex flex-col overflow-y-auto">
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

      <div className="flex flex-col flex-1 p-4 gap-8">
        <section className="flex flex-col gap-2">
          <div className="text-white/80 text-lg">Human</div>

          {playerId ? (
            <div className="flex items-center gap-2 w-full">
              <MyAvatar
                className="w-12 h-12"
                alt="avatar"
                src={playerId ? ctx.profiles[playerId]?.avatarUrl : null}
              />
              <div className="flex-1 text-lg">
                {playerId ? ctx.profiles[playerId]?.username ?? '...' : '...'}
              </div>
              {ctx.currentUserId === playerId && (
                <MyButton
                  size="sm"
                  variant="text"
                  color="primary"
                  onClick={onStopPlaying}
                >
                  Stop Playing
                </MyButton>
              )}
            </div>
          ) : (
            <MyButton
              className="w-full"
              color="primary"
              variant="contained"
              onClick={onStartPlaying}
            >
              Start Playing
            </MyButton>
          )}
        </section>

        {ctx.currentUserId === playerId && (
          <>
            <section className="flex flex-col gap-2">
              <div className="text-white/80 text-lg"> Play As</div>
              <ChoiceChips
                choices={player.values}
                onSelect={player.onInput}
                selected={player.selected}
                toKey={player.toName}
                renderChoice={(choice) => player.render({ playerType: choice })}
              />
            </section>

            <section className="flex flex-col gap-2">
              <div className="text-white/80 text-lg"> Computer</div>

              <div className="w-full">
                <ChoiceChips
                  choices={botLevel.values}
                  onSelect={botLevel.onInput}
                  selected={botLevel.selected}
                  toKey={botLevel.toName}
                  renderChoice={(choice) =>
                    botLevel.render({ botLevel: choice })
                  }
                />
              </div>
            </section>
          </>
        )}
      </div>

      <div className="flex items-center gap-4 p-4">
        <MyButton className="w-full" onClick={onCancel}>
          Back
        </MyButton>
        <MyButton
          disabled={!playerId}
          className="w-full"
          color="primary"
          onClick={onStartGame}
        >
          Start
        </MyButton>
      </div>
    </div>
  );
};

const ChoiceChips = <TChoice,>({
  selected,
  choices,
  toKey,
  onSelect,
  renderChoice,
}: {
  selected: TChoice;
  choices: TChoice[];
  onSelect: (choice: TChoice) => void;
  toKey: (choice: TChoice) => string;
  renderChoice: (choice: TChoice) => ReactNode;
}) => {
  return (
    <div className="grid grid-cols-3 gap-2 place-items-stretch">
      {choices.map((choice) => {
        const isSelected = toKey(selected) === toKey(choice);
        return (
          <button
            onClick={() => onSelect(choice)}
            key={toKey(choice)}
            disabled={isSelected}
            className={classNames(
              'px-2 py-1 rounded-full text-lg overflow-hidden',
              isSelected && 'bg-white text-black',
              !isSelected &&
                'bg-neutral-900 border border-neutral-800 active:opacity-50'
            )}
          >
            {renderChoice(choice)}
          </button>
        );
      })}
    </div>
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
