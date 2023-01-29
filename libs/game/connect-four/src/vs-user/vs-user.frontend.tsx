import { keyframes } from '@emotion/react';
import { Alerts } from '@gamezilla/shared';
import { Cmd, exhaustive, Sub } from '@gamezilla/core';
import { UserId } from '@gamezilla/shared';
import { Ctx } from '@gamezilla/shared';
import {
  ActionButton,
  Avatar,
  Box,
  Button,
  CircularProgress,
  ConformationDialog,
  Divider,
  Fade,
  FillBox,
  Icons,
  Paper,
  Sx,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useTheme,
} from '@gamezilla/shared/ui';
import {
  PlayerType,
  playerTypeToColor,
  toStatus,
  toTurn,
} from '../connect-four/connect-four';
import {
  gameTheme,
  initVisual,
  PlayerIcon,
  PlayerOneIcon,
  PlayerTwoIcon,
  ViewColumns,
} from '../connect-four/connect-four-ui';
import {
  allMoveTimeLimit,
  BackendModel,
  FrontendModel,
  FrontendMsg,
  GameModel,
  GameOverModel,
  handle,
  initShared,
  resultToString,
  SetupModel,
  ToBackend,
  ToFrontend,
  toPlayerType,
} from './vs-user.types';

//
//
//
// Model
//
//
//

export type Model = FrontendModel;

export const init = ({
  PlayerOne,
  PlayerTwo,
}: Pick<FrontendModel, 'PlayerOne' | 'PlayerTwo'>): FrontendModel => {
  return {
    ...initShared({ PlayerOne, PlayerTwo }),
    ghostIndex: 'none',
    openedModal: 'none',
  };
};

//
//
//
// Update
//
//
//

export type Msg = FrontendMsg;

export type OutAction = Alerts.Action;

export const update = (
  { sendToBackend }: { sendToBackend: (msg: ToBackend) => Cmd },
  msg: Msg,
  model: Model
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    //
    //
    //
    //
    //

    case 'ClickedResign': {
      return [{ ...model, openedModal: 'ConfirmResign' }, Cmd.None];
    }

    case 'HoveredOverColumns': {
      const { columnIndex } = msg[1];
      return [{ ...model, ghostIndex: columnIndex }, Cmd.None];
    }

    case 'CloseModal': {
      return [{ ...model, openedModal: 'none' }, Cmd.None];
    }

    //
    //
    //
    //
    //

    case 'Resign':
    case 'NewGame':
    case 'Rematch_Request':
    case 'Rematch_Respond':
    case 'Rematch_Cancel':
    case 'InputMoveTimeLimit':
    case 'start-game':
    case 'stop-playing':
    case 'start-playing': {
      return [model, sendToBackend(msg)];
    }
    case 'input-move': {
      return [
        {
          ...model,
          // ghostIndex: "none"
        },
        sendToBackend(msg),
      ];
    }
    default: {
      return exhaustive(msg[0]);
    }
  }
};

export const updateFromBackend = (
  msg: ToFrontend,
  model: Model
): [Model, Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case 'NewGame':
    case 'InputMoveTimeLimit':
    case 'start-game':
    case 'stop-playing':
    case 'Rematch_Cancel':
    case 'Resign':
    case 'Rematch_Request':
    case 'Rematch_Respond':
    case 'start-playing': {
      const modelNew = msg[1].type === 'Err' ? model : msg[1].value;
      const merged = mergeWithBackend({
        frontendModel: model,
        backendModel: modelNew,
      });
      return [{ ...merged, openedModal: 'none' }, Cmd.None, []];
    }

    case 'input-move': {
      const modelNew = msg[1].type === 'Err' ? model : msg[1].value;
      const merged = mergeWithBackend({
        frontendModel: model,
        backendModel: modelNew,
      });
      return [{ ...merged, ghostIndex: 'none' }, Cmd.None, []];
    }

    case 'Tick_Done': {
      const merged = mergeWithBackend({
        frontendModel: model,
        backendModel: msg[1],
      });
      return [merged, Cmd.None, []];
    }

    case 'player-left': {
      const merged = mergeWithBackend({
        frontendModel: model,
        backendModel: msg[1],
      });
      return [merged, Cmd.None, []];
    }

    default: {
      return exhaustive(msg[0]);
    }
  }
};

export const mergeWithBackend = ({
  frontendModel,
  backendModel,
}: {
  frontendModel: FrontendModel;
  backendModel: BackendModel;
}): FrontendModel => {
  return {
    ...backendModel,
    openedModal: frontendModel.openedModal,
    ghostIndex: frontendModel.ghostIndex,
  };
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (_model: Model): Sub<Msg> => {
  return Sub.None;
};

//
//
//
// View
//
//
//

export const View = ({
  ctx,
  model,
  $send,
  goBack,
}: {
  model: Model;
  ctx: Ctx;
  $send: (msg: Msg) => void;
  goBack: () => void;
}) => {
  if (model.type === 'Setup') {
    return <ViewSetup ctx={ctx} goBack={goBack} model={model} $send={$send} />;
  }

  if (model.type === 'game') {
    const currentUserPlayerType = toPlayerType(ctx.currentUserId, model);

    return (
      <>
        <FillBox>
          <PlayerSlotBar model={model} ctx={ctx} />

          <ViewColumns
            visual={initVisual({ nowMs: Date.now(), columns: model.columns })}
            columns={model.columns}
            onClick={(columnIndex) =>
              $send(['input-move', { userId: ctx.currentUserId, columnIndex }])
            }
            onHover={(columnIndex) =>
              $send(['HoveredOverColumns', { columnIndex }])
            }
            disabled={toTurn(model.columns) !== currentUserPlayerType}
            ghost={
              currentUserPlayerType !== 'none' && model.ghostIndex !== 'none'
                ? {
                    playerType: currentUserPlayerType,
                    columnIndex: model.ghostIndex,
                  }
                : undefined
            }
          />

          <Box sx={{ flex: 1 }}></Box>

          <Box sx={{ display: 'flex' }}>
            <ActionButton
              icon={<Icons.Flag />}
              label="Resign"
              onClick={() =>
                $send(['ClickedResign', { userId: ctx.currentUserId }])
              }
            />
          </Box>
        </FillBox>

        <ConformationDialog
          headerIcon={<Icons.Flag sx={{ width: 52, height: 52 }} />}
          title="Resign from game?"
          onCancel={() => $send(['CloseModal'])}
          onClose={() => $send(['CloseModal'])}
          confirmTitle="Resign"
          onConfirm={() => $send(['Resign', { userId: ctx.currentUserId }])}
          open={model.openedModal === 'ConfirmResign'}
        />
      </>
    );
  }

  return (
    <FillBox>
      <PlayerSlotBar model={model} ctx={ctx} />

      <Box sx={{ position: 'relative' }}>
        <ViewColumns
          visual={initVisual({ nowMs: Date.now(), columns: model.columns })}
          columns={model.columns}
          disabled
        />

        {model.type === 'GameOver' && (
          <Fade in>
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                maxHeight: '100%',
                overflow: 'hidden',
                background: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                color: '#fff',
              }}
            >
              <ViewGameOverMessage $send={$send} ctx={ctx} model={model} />
            </Box>
          </Fade>
        )}
      </Box>

      <Box sx={{ flex: 1 }}></Box>

      <Box sx={{ display: 'flex', padding: 2, gap: 2 }}>
        <Button
          variant="outlined"
          fullWidth
          onClick={() => $send(['NewGame', { userId: ctx.currentUserId }])}
        >
          Back
        </Button>

        <Button
          variant="contained"
          fullWidth
          disabled={model.rematch.type === 'Asking'}
          onClick={() =>
            $send(['Rematch_Request', { userId: ctx.currentUserId }])
          }
        >
          Rematch
        </Button>
      </Box>
    </FillBox>
  );
};

const ViewGameOverMessage = ({
  ctx,
  model,
  $send,
}: {
  model: GameOverModel;
  ctx: Ctx;
  $send: (msg: Msg) => void;
}) => {
  const size = { width: 84, height: 84 };

  const currentPlayerType = toPlayerType(ctx.currentUserId, model);

  if (
    model.rematch.type === 'Asking' &&
    model.rematch.asker === currentPlayerType
  ) {
    return (
      <>
        <Typography align="center" sx={{ fontSize: '2rem', marginBottom: 4 }}>
          Waiting for response
        </Typography>
        <CircularProgress sx={{ marginBottom: 4 }} />
        <Button
          variant="contained"
          onClick={() =>
            $send(['Rematch_Cancel', { userId: ctx.currentUserId }])
          }
        >
          Cancel
        </Button>
      </>
    );
  }

  if (
    model.rematch.type === 'Asking' &&
    model.rematch.asker !== currentPlayerType &&
    currentPlayerType !== null
  ) {
    return (
      <>
        <Typography align="center" sx={{ fontSize: '3rem', marginBottom: 4 }}>
          Rematch?
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="inherit"
            sx={{ color: '#000' }}
            startIcon={<Icons.Cancel />}
            onClick={() =>
              $send([
                'Rematch_Respond',
                { response: 'Decline', userId: ctx.currentUserId },
              ])
            }
          >
            Decline
          </Button>
          <Button
            variant="contained"
            startIcon={<Icons.Done />}
            onClick={() =>
              $send([
                'Rematch_Respond',
                { response: 'Accept', userId: ctx.currentUserId },
              ])
            }
          >
            Accept
          </Button>
        </Box>
      </>
    );
  }

  if (model.gameOver.type === 'Draw') {
    return <Typography sx={{ fontSize: '3rem' }}>Tie</Typography>;
  }

  if (model.gameOver.type === 'Resignation') {
    const { resigner } = model.gameOver;

    const winner: PlayerType =
      resigner === 'PlayerOne' ? 'PlayerTwo' : 'PlayerOne';

    if (currentPlayerType === 'none') {
      return (
        <>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              justifyContent: 'center',
            }}
          >
            <PlayerIcon sx={{ ...size, marginRight: 2 }} playerType={winner} />
            <Avatar
              sx={{ ...size }}
              src={ctx.profiles[model[winner]]?.avatarUrl}
            />
          </Box>
          <Typography sx={{ fontSize: '2.5rem' }}>Winner</Typography>
        </>
      );
    }

    return (
      <>
        <Typography sx={{ fontSize: '3rem' }}>
          {currentPlayerType === winner ? 'You Won' : 'You Lost'}
        </Typography>
        <Typography>by resignation</Typography>
      </>
    );
  }

  if (model.gameOver.type === 'Winner') {
    const { winner } = model.gameOver;

    if (currentPlayerType === 'none') {
      return (
        <>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              justifyContent: 'center',
            }}
          >
            <PlayerIcon sx={{ ...size, marginRight: 2 }} playerType={winner} />
            <Avatar
              sx={{ ...size }}
              src={ctx.profiles[model[winner]]?.avatarUrl}
            />
          </Box>
          <Typography sx={{ fontSize: 50 }}>Winner</Typography>
        </>
      );
    }

    return (
      <Typography sx={{ fontSize: 64 }}>
        {currentPlayerType === winner ? 'You Won' : 'You Lost'}
      </Typography>
    );
  }

  return null;
};

const ViewSetup = ({
  model,
  $send,
  ctx,
  goBack,
}: {
  goBack: () => void;
  model: SetupModel;
  ctx: Ctx;
  $send: (msg: Msg) => void;
}) => {
  const startGameResult = handle(
    ['start-game', { userId: ctx.currentUserId }],
    model
  );
  const inputMoveTimeLimitResult = handle(
    [
      'InputMoveTimeLimit',
      { moveTimeLimit: model.moveTimeLimit, userId: ctx.currentUserId },
    ],
    model
  );

  return (
    <FillBox>
      <ViewVersusHeader model={model} ctx={ctx} />

      <Typography
        color="text.secondary"
        sx={{ paddingX: 2, paddingTop: 2, paddingBottom: 1 }}
      >
        Players
      </Typography>

      <ViewSetupPlayerSlot
        ctx={ctx}
        playerType={'PlayerOne'}
        userId={model.PlayerOne}
        $send={$send}
      />

      <ViewSetupPlayerSlot
        ctx={ctx}
        playerType={'PlayerTwo'}
        userId={model.PlayerTwo}
        $send={$send}
      />

      <Divider sx={{ paddingBottom: 2 }} />

      <Typography
        color="text.secondary"
        sx={{ paddingX: 2, paddingTop: 2, paddingBottom: 1 }}
      >
        Time Limit
      </Typography>

      <Box sx={{ paddingX: 2 }}>
        <Tooltip title={resultToString(inputMoveTimeLimitResult)}>
          <ToggleButtonGroup
            fullWidth
            value={model.moveTimeLimit}
            disabled={inputMoveTimeLimitResult.type === 'Err'}
          >
            {Object.values(allMoveTimeLimit).map((moveTimeLimit) => (
              <ToggleButton
                key={moveTimeLimit}
                value={moveTimeLimit}
                onClick={() =>
                  $send([
                    'InputMoveTimeLimit',
                    { moveTimeLimit, userId: ctx.currentUserId },
                  ])
                }
              >
                {`${moveTimeLimit} sec`}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Tooltip>
      </Box>

      <Box sx={{ flex: 1 }} />

      <Box sx={{ padding: 2, gap: 2, display: 'flex' }}>
        <Button variant="outlined" fullWidth onClick={goBack}>
          Back
        </Button>
        <Button
          variant="contained"
          fullWidth
          disabled={startGameResult.type === 'Err'}
          onClick={() => $send(['start-game', { userId: ctx.currentUserId }])}
        >
          Start Game
        </Button>
      </Box>
    </FillBox>
  );
};

const PlayerSlotBar = ({
  model,
  ctx,
}: {
  model: GameModel | GameOverModel;
  ctx: Ctx;
}) => {
  return (
    <Box sx={{ paddingTop: 2, paddingBottom: 1 }}>
      <Box
        sx={{
          paddingX: 1,
          mb: 1,
          gap: 1,
          display: 'flex',
          width: '100%',
          overflow: 'hidden',
        }}
      >
        <PlayerSlot playerType="PlayerOne" model={model} ctx={ctx} />
        <PlayerSlot playerType="PlayerTwo" model={model} ctx={ctx} />
      </Box>
      <Feedback ctx={ctx} model={model} />
    </Box>
  );
};

const flicker = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.66; }
  100% { opacity: 1; }
`;

const Feedback = ({
  ctx,
  model,
}: {
  ctx: Ctx;
  model: GameModel | GameOverModel;
}) => {
  if (model.type === 'GameOver') {
    return (
      <Typography
        color="text.secondary"
        align="center"
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        Game Over
      </Typography>
    );
  }

  const turn = toTurn(model.columns);

  const currentUserPlayerType = toPlayerType(ctx.currentUserId, model);

  if (currentUserPlayerType === turn) {
    if (model.moveCountDown <= 5) {
      return (
        <Typography
          align="center"
          sx={{ animation: `${flicker} 0.75s infinite ease` }}
        >
          Move in {model.moveCountDown}...
        </Typography>
      );
    }

    return (
      <Typography
        align="center"
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          animation: `${flicker} 0.75s infinite ease`,
        }}
      >
        <PlayerIcon
          sx={{ width: '1rem', height: '1rem', mr: 1 / 2 }}
          playerType={turn}
        />
        Your Turn
      </Typography>
    );
  }

  return (
    <Typography
      color="text.secondary"
      align="center"
      sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
    >
      <PlayerIcon
        sx={{ width: '1rem', height: '1rem', mr: 1 / 2 }}
        playerType={turn}
      />
      Turn
    </Typography>
  );
};

const PlayerSlot = ({
  model,
  playerType,
  ctx,
}: {
  model: GameModel | GameOverModel;
  playerType: PlayerType;
  ctx: Ctx;
}) => {
  const size = { width: '1.5rem', height: '1.5rem' };
  const status = toStatus(model.columns);
  const uiTheme = useTheme();
  return (
    <Paper
      variant="outlined"
      sx={{
        display: 'flex',
        alignItems: 'center',
        flex: 1,
        overflow: 'hidden',
        p: 1,
        boxSizing: 'content-box',
        borderBottom:
          status.type === 'Playing' && status.turn === playerType
            ? `solid 3px ${gameTheme.primary.dark}`
            : `solid 3px ${uiTheme.palette.divider}`,
      }}
    >
      <PlayerIcon playerType={playerType} sx={{ ...size, marginRight: 1 }} />
      <Avatar
        src={ctx.profiles[model[playerType]]?.avatarUrl}
        sx={{ ...size, marginRight: 1 }}
      />
      <Typography noWrap color="text.secondary">
        {ctx.profiles[model[playerType]]?.username ?? '...'}
      </Typography>
    </Paper>
  );
};

const ViewSetupPlayerSlot = ({
  $send,
  userId,
  ctx,
  playerType,
}: {
  $send: (msg: Msg) => void;
  playerType: PlayerType;
  userId: 'none' | UserId;
  ctx: Ctx;
}) => {
  return (
    <Box
      sx={{
        paddingX: 2,
        display: 'flex',
        paddingBottom: 2,
        alignItems: 'center',
      }}
    >
      <PlayerIcon
        playerType={playerType}
        sx={{ width: 42, height: 42, marginRight: 1 }}
      />
      {userId === 'none' ? (
        <Button
          fullWidth
          variant="contained"
          onClick={() =>
            $send(['start-playing', { userId: ctx.currentUserId, playerType }])
          }
        >
          Play as {playerTypeToColor[playerType]}
        </Button>
      ) : (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden',
            flex: 1,
          }}
        >
          <Avatar
            src={ctx.profiles[userId]?.avatarUrl}
            sx={{ marginRight: 1 }}
          />
          <Typography noWrap sx={{ flex: 1 }}>
            {ctx.profiles[userId]?.username ?? '...'}
          </Typography>
          {userId === ctx.currentUserId && (
            <Button
              onClick={() =>
                $send(['stop-playing', { userId: ctx.currentUserId }])
              }
            >
              Stop Playing
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
};

const ViewVersusHeader = ({ model, ctx }: { model: SetupModel; ctx: Ctx }) => {
  const avatarSx: Sx = {
    // width: 36,
    // height: 36,
  };
  const iconSx: Sx = {
    width: 52,
    height: 52,
  };

  return (
    <Box
      sx={{
        paddingY: 6,
        paddingX: 2,
        background: `linear-gradient(${gameTheme.primary.dark}, ${gameTheme.primary.darker})`,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <Box sx={{ width: 72, overflow: 'hidden', textAlign: 'center' }}>
        <Avatar
          sx={{ ...avatarSx, marginX: 'auto' }}
          src={
            model.PlayerOne === 'none'
              ? ''
              : ctx.profiles[model.PlayerOne]?.avatarUrl
          }
        >
          <Icons.QuestionMark />
        </Avatar>
        <Typography color="#fff" align="center" noWrap>
          {model.PlayerOne === 'none'
            ? '?'
            : ctx.profiles[model.PlayerOne]?.username ?? '...'}
        </Typography>
      </Box>
      <PlayerOneIcon sx={{ ...iconSx }} />
      <Typography color="#fff" sx={{ fontSize: 32 }}>
        vs
      </Typography>
      <PlayerTwoIcon sx={{ ...iconSx }} />
      <Box sx={{ width: 72, overflow: 'hidden', textAlign: 'center' }}>
        <Avatar
          sx={{ ...avatarSx, marginX: 'auto' }}
          src={
            model.PlayerTwo === 'none'
              ? ''
              : ctx.profiles[model.PlayerTwo]?.avatarUrl
          }
        >
          <Icons.QuestionMark />
        </Avatar>
        <Typography color="#fff" align="center" noWrap>
          {model.PlayerTwo === 'none'
            ? '?'
            : ctx.profiles[model.PlayerTwo]?.username ?? '...'}
        </Typography>
      </Box>
    </Box>
  );
};
