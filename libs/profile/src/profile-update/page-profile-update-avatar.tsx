import { Cmd, p } from '@gamezilla/core';
import { Alerts, ProfileAvatar, Route, UserId } from '@gamezilla/shared';
import {
  Avatar,
  Box,
  Button,
  FillBox,
  Header,
  LoadingDialog,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@gamezilla/shared/ui';
import * as ProfileStore from '../profile-store';

//
//
//
// Model
//
//
//

export type Model = {
  status:
    | 'idle'
    | 'generating-seed'
    | 'style-select-opened'
    | 'updating-avatar';
  seed: ProfileAvatar.Seed;
  style: ProfileAvatar.Style;
};

export const init = ({ avatarUrl }: { avatarUrl: string }): Model => {
  const { seed, style } = ProfileAvatar.parseUrl(avatarUrl);

  return {
    status: 'idle',
    seed,
    style,
  };
};

//
//
//
// Update
//
//
//

export type Msg =
  | ['clicked-cancel']
  | ['clicked-done']
  | ['style-select-closed']
  | ['style-select-opened']
  | ['clicked-random-seed']
  | ['clicked-style', ProfileAvatar.Style]
  | ['inputted-seed', ProfileAvatar.Seed]
  | ['random-seed-generated', ProfileAvatar.Seed];

type OutAction = Alerts.Action | ProfileStore.Action;

export const update = ({
  currentUserId,
  msg,
  model,
}: {
  currentUserId: UserId;
  msg: Msg;
  model: Model;
}): { model: Model; cmd?: Cmd<Msg>; actions?: OutAction[] } => {
  switch (msg[0]) {
    case 'clicked-cancel':
      return { model, cmd: Route.back };

    case 'style-select-closed':
      return { model: { ...model, status: 'idle' } };

    case 'style-select-opened':
      return { model: { ...model, status: 'style-select-opened' } };

    case 'inputted-seed':
      return { model: { ...model, seed: msg[1] } };

    case 'clicked-random-seed':
      return {
        model: { ...model, status: 'generating-seed' },
        cmd: p(
          ProfileAvatar.generateRandomSeed,
          Cmd.perform((seed) => ['random-seed-generated', seed])
        ),
      };

    case 'random-seed-generated':
      return { model: { ...model, status: 'idle', seed: msg[1] } };

    case 'clicked-style':
      return { model: { ...model, style: msg[1] } };

    case 'clicked-done':
      return {
        model,
        cmd: Route.back,
        actions: [
          [
            'profile',
            [
              'edit-one',
              {
                userId: currentUserId,
                edits: { avatarUrl: ProfileAvatar.toUrl(model) },
              },
            ],
          ],
        ],
      };
  }
};

//
//
//
// Update
//
//
//

export const View = ({
  model,
  $send,
}: {
  model: Model;
  $send: (msg: Msg) => void;
}) => {
  return (
    <FillBox>
      <Header
        left={
          <Button
            sx={{ marginLeft: -1 }}
            onClick={() => $send(['clicked-cancel'])}
          >
            Cancel
          </Button>
        }
        title="Avatar"
        right={
          <Button
            sx={{ marginRight: -1 }}
            onClick={() => $send(['clicked-done'])}
          >
            Done
          </Button>
        }
      />

      <Avatar
        src={ProfileAvatar.toUrl(model)}
        sx={{
          marginX: 'auto',
          width: '150px',
          height: '150px',
          marginBottom: 1,
        }}
      />

      <LoadingDialog
        open={model.status === 'updating-avatar'}
        title="Updating avatar..."
      />

      <Box sx={{ padding: 2 }}>
        <Typography variant="subtitle1" sx={{ marginBottom: 1 }}>
          Style
        </Typography>
        <Select
          sx={{ marginBottom: 2 }}
          open={model.status === 'style-select-opened'}
          fullWidth
          value={model.style}
          onOpen={() => $send(['style-select-opened'])}
          onClose={() => $send(['style-select-closed'])}
          renderValue={(style) => (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Avatar
                sx={{ marginRight: 1, width: 24, height: 24 }}
                src={ProfileAvatar.toUrl({
                  style,
                  seed: ProfileAvatar.toSeed(model.seed),
                })}
              />
              <Typography>{ProfileAvatar.formatStyle(style)}</Typography>
            </Box>
          )}
        >
          {ProfileAvatar.ALL_STYLES.map((style) => (
            <MenuItem
              key={style}
              value={style}
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
              }}
              onClick={() => $send(['clicked-style', style])}
            >
              <Avatar
                sx={{ marginRight: 1 }}
                src={ProfileAvatar.toUrl({
                  style,
                  seed: ProfileAvatar.toSeed(model.seed),
                })}
              />
              <Typography>{ProfileAvatar.formatStyle(style)}</Typography>
            </MenuItem>
          ))}
        </Select>

        <Typography variant="subtitle1" sx={{ marginBottom: 1 }}>
          Seed
        </Typography>

        <TextField
          fullWidth
          value={model.seed}
          onChange={(event) =>
            $send([
              'inputted-seed',
              ProfileAvatar.toSeed(event.currentTarget.value),
            ])
          }
          sx={{ marginBottom: 2 }}
        />

        <Button
          loading={model.status === 'generating-seed'}
          fullWidth
          variant="outlined"
          onClick={() => $send(['clicked-random-seed'])}
          sx={{ marginBottom: 4 }}
        >
          Random Seed
        </Button>
      </Box>
    </FillBox>
  );
};
