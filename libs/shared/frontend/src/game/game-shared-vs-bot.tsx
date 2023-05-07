import {
  Avatar,
  Box,
  CircularProgress,
  IconName,
  Icons,
  MyAvatar,
  MyButton,
  Paper,
  Sx,
  Typography,
  ViewNode,
  cn,
  icon,
} from '@gamezilla/shared/ui';
import { ReactNode } from 'react';
import { ViewCtx } from '../ctx';
import { UserId } from '@gamezilla/shared/app';

export const ViewVsBotSetupScreen = <BotLevel, PlayerType>({
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
  ctx: ViewCtx;
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
      <ViewVersusBlock
        viewPlayerIcon={({ sx, playerType }) => player.icon({ sx, playerType })}
        playerId={playerId}
        botName={String(botLevel.selected)}
        ctx={ctx}
        userPlayerType={player.selected}
        botPlayerType={
          player.values.find((p) => p !== player.selected) ?? player.selected
        }
        leftPlayerType={leftPlayerType}
      />

      <div className="flex flex-col flex-1 p-4 gap-8 border-t border-neutral-700">
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

export const ChoiceChips = <TChoice,>({
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
            className={cn(
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

const ViewVersusBlock = <PlayerType,>({
  playerId,
  botName,
  ctx,
  viewPlayerIcon,
  userPlayerType,
  botPlayerType,
  leftPlayerType,
}: {
  ctx: ViewCtx;
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

const ViewBottomButtonBar = ({
  actions,
}: {
  actions: [string, IconName, () => void][];
}) => {
  return (
    <div className="flex items-center border-t border-neutral-700">
      {actions.map(([label, iconName, onClick]) => (
        <button
          key={label}
          onClick={onClick}
          className="flex-1 flex flex-col p-1 gap-0.5 text-sm items-center active:opacity-50"
        >
          {icon(iconName)}
          <p className="text-xs">{label}</p>
        </button>
      ))}
    </div>
  );
};

export const ViewVsBotGameScreen = <PlayerType,>({
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
  ctx: ViewCtx;
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
    gameOver.type !== 'none' ? (
      <>Game Over</>
    ) : (
      <>
        {viewPlayerIcon({
          playerType: turn,
          sx: { width: '1rem', height: '1rem', mr: 1 / 2 },
        })}
        {turn === userPlayer && !isSpectating ? 'Your Turn' : 'Turn'}
      </>
    );

  return (
    <div
      className={cn(
        'w-full h-full flex flex-col',
        isSpectating && 'border-4 border-purple-500'
      )}
    >
      {isSpectating && (
        <div className="bg-purple-500 text-white text-center p-1">
          You are spectating
        </div>
      )}

      <div className="flex-1 flex flex-col items-center w-full justify-center">
        <div className="px-2 pt-2 flex gap-2 justify-center items-center w-full">
          {leftSlot}
          {rightSlot}
        </div>
        <p className="px-4 py-2 text-center flex items-center justify-center w-full">
          {feedback}
        </p>

        {viewBoard()}
      </div>

      {!isSpectating && (
        <ViewBottomButtonBar
          actions={gameOver.type === 'none' ? actions : gameOverActions}
        />
      )}
    </div>
  );
};
