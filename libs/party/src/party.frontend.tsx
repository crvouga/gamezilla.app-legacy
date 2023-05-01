import { Cmd, exhaustive, p, RemoteData, Sub } from '@gamezilla/core';
import { PartyId, UserId, ViewCtx } from '@gamezilla/shared';
import { Ctx, Route } from '@gamezilla/shared';
import {
  Avatar,
  Box,
  Button,
  FillBox,
  Header,
  Icons,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Typography,
  useTheme,
  ViewEmptyState,
} from '@gamezilla/shared/ui';
import { Mic } from './mic';
import {
  FrontendModel,
  FrontendMsg,
  ToBackend,
  ToFrontend,
} from './party.types';

//
//
//
// Model
//
//
//

export type Model = FrontendModel;

export const init = ({
  sendToBackend,
}: {
  sendToBackend: (msg: ToBackend) => Cmd;
}): [Model, Cmd<Msg>] => {
  return [
    {
      parties: {},
      users: {},
      //
      requests: {},
      volume: 0,
    },
    sendToBackend(['party-get', null]),
  ];
};

//
//
//
// Update
//
//
//

export type Msg = FrontendMsg;

export const update = (
  { sendToBackend }: { sendToBackend: (msg: ToBackend) => Cmd },
  msg: Msg,
  model: Model
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case 'clicked-banner': {
      return [model, Cmd.None];
    }

    case 'MicSound': {
      return [{ ...model, volume: msg[1].volume }, Cmd.None];
    }

    case 'MicUnload':
    case 'MicLoad': {
      return [model, Cmd.None];
    }

    case 'party-get':
    case 'PartyCreate':
    case 'PartyDestroy':
    case 'PartyLeave':
    case 'PartyJoin': {
      return [
        {
          ...model,
          requests: { ...model.requests, [msg[0]]: RemoteData.Loading },
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
  { currentUserId }: { currentUserId: UserId },
  msg: ToFrontend,
  model: Model
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case 'party-get':
    case 'PartyDestroy':
    case 'PartyCreate':
    case 'PartyJoin':
    case 'PartyLeave': {
      const requestsNew: Model['requests'] = {
        ...model.requests,
        [msg[0]]: p(
          msg[2],
          RemoteData.map(() => null)
        ),
      };

      if (msg[2].type === 'Err') {
        return [{ ...model, requests: requestsNew }, Cmd.None];
      }

      const modelNext: Model = {
        ...model,
        requests: requestsNew,
        ...msg[2].value,
      };

      const cmd = toLifecycleCmd({
        currentUserId,
        modelNext: modelNext,
        modelPrev: model,
      });

      return [modelNext, cmd];
    }
    default: {
      return exhaustive(msg[0]);
    }
  }
};

const toLifecycleCmd = ({
  currentUserId,
  modelNext,
  modelPrev,
}: {
  currentUserId: UserId;
  modelPrev: Model;
  modelNext: Model;
}): Cmd<Msg> => {
  const userPrev = modelPrev.users[currentUserId];
  const userNext = modelNext.users[currentUserId];

  // did user just leave party?
  if (userPrev && !userNext) {
    return p(
      Mic.unload,
      Cmd.perform((result) => ['MicUnload', result])
    );
  }

  // did user just join party?
  if (!userPrev && userNext) {
    return p(
      Mic.load,
      Cmd.perform((result) => ['MicLoad', result])
    );
  }

  return Cmd.None;
};

export type Action = ['party', ['Msg', Msg]];

export const runAction = (
  wire: { sendToBackend: (msg: ToBackend) => Cmd },
  action: Action,
  model: Model
): [Model, Cmd<Msg>] => {
  switch (action[1][0]) {
    case 'Msg': {
      return update(wire, action[1][1], model);
    }
  }
};

//
//
//
// View
//
//
//

export const ViewPage = ({
  ctx,
  model,
  $send,
}: {
  ctx: Ctx;
  model: Model;
  $send: (msg: Msg) => void;
}) => {
  const theme = useTheme();
  const user = model.users[ctx.currentUserId];

  if (!user) {
    return <ViewNotInParty ctx={ctx} model={model} $send={$send} />;
  }

  const party = model.parties[user.partyId];

  if (!party) {
    return <ViewNotInParty ctx={ctx} model={model} $send={$send} />;
  }

  return (
    <FillBox>
      <Box sx={{ flex: 1, display: 'flex', flexWrap: 'wrap', width: '100%' }}>
        {Object.values(model.users)
          .filter((user) => user.partyId === party.partyId)
          .map((user) => {
            const isActive =
              model.volume > 1 && user.userId === ctx.currentUserId;

            return (
              <Box
                key={user.userId}
                sx={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
              >
                <Box sx={{ padding: 2 }}>
                  <Avatar
                    src={ctx.profiles[user.userId]?.avatarUrl}
                    sx={{
                      width: 100,
                      height: 100,
                      boxSizing: 'content-box',
                      border: `solid 8px ${
                        isActive ? theme.palette.primary.main : 'transparent'
                      }`,
                    }}
                  />
                </Box>
                <Typography
                  variant="h6"
                  noWrap
                  sx={{ width: '100%', paddingX: 1 }}
                  align="center"
                >
                  {`${ctx.profiles[user.userId]?.username ?? '...'}`}
                </Typography>
                <Typography
                  variant="subtitle1"
                  color="text.secondary"
                  sx={{ height: '1rem' }}
                >
                  {party.hostId === user.userId ? 'Host' : ' '}
                </Typography>
              </Box>
            );
          })}
      </Box>
      <Box
        sx={{
          paddingX: 2,
          paddingY: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {party.hostId === ctx.currentUserId ? (
          <Button
            variant="outlined"
            startIcon={<Icons.CallEnd />}
            color="error"
            size="large"
            loading={model.requests.PartyDestroy?.type === 'Loading'}
            onClick={() =>
              $send(['PartyDestroy', { userId: ctx.currentUserId }])
            }
          >
            End
          </Button>
        ) : (
          <Button
            variant="outlined"
            startIcon={<Icons.CallEnd />}
            color="error"
            size="large"
            loading={model.requests.PartyLeave?.type === 'Loading'}
            onClick={() => $send(['PartyLeave', { userId: ctx.currentUserId }])}
          >
            Leave
          </Button>
        )}
      </Box>
    </FillBox>
  );
};

const ViewNotInParty = ({
  ctx,
  model,
  $send,
}: {
  ctx: Ctx;
  model: Model;
  $send: (msg: Msg) => void;
}) => {
  const parties = Object.values(model.parties);

  if (parties.length === 0) {
    return (
      <FillBox>
        <Header title="Party" />
        <ViewEmptyState
          renderIcon={({ sx }) => <Icons.People sx={sx} />}
          title="No Active Parties"
        />
      </FillBox>
    );
  }

  return (
    <FillBox>
      <Header title="Party" />
      <Box sx={{ paddingX: 2 }}>
        <Button
          fullWidth
          variant="contained"
          size="large"
          loading={model.requests.PartyCreate?.type === 'Loading'}
          onClick={() =>
            $send([
              'PartyCreate',
              { userId: ctx.currentUserId, partyId: PartyId.generate() },
            ])
          }
        >
          Start Party
        </Button>
      </Box>
      <Box sx={{ flex: 1 }}>
        {parties.map((party) => (
          <ListItemButton
            key={party.partyId}
            onClick={() =>
              $send([
                'PartyJoin',
                { userId: ctx.currentUserId, partyId: party.partyId },
              ])
            }
          >
            <ListItemAvatar>
              <Avatar src={ctx.profiles[party.hostId]?.avatarUrl} />
            </ListItemAvatar>

            <ListItemText
              primary={`${
                ctx.profiles[party.hostId]?.username ?? '...'
              }'s party`}
              secondary={`${countUsersInParty(party.partyId, model)} in party`}
            />
          </ListItemButton>
        ))}
      </Box>
    </FillBox>
  );
};

const countUsersInParty = (partyId: PartyId, model: Model): number => {
  let count = 0;
  for (const userId in model.users) {
    if (UserId.is(userId) && model.users[userId]?.partyId === partyId) {
      count++;
    }
  }
  return count;
};

export const ViewBanner = ({
  $send,
  model,
  ctx,
}: {
  ctx: ViewCtx;
  route: Route.Route;
  model: Model;
  $send: (msg: Msg) => void;
}) => {
  const user = model.users[ctx.currentUserId];

  if (!user) {
    return null;
  }

  const party = model.parties[user.partyId];

  if (!party) {
    return null;
  }

  return (
    <Typography
      variant="caption"
      align="center"
      onClick={() => $send(['clicked-banner'])}
      sx={{
        width: '100%',
        paddingX: 2,
        paddingY: 1 / 2,
        backgroundColor: 'primary.dark',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icons.Group sx={{ marginRight: 1 / 2 }} />
      Party
    </Typography>
  );
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (_model: Model): Sub<Msg> => {
  return p(
    Mic.volumes,
    Sub.map((volume) => ['MicSound', { volume }])
  );
};
