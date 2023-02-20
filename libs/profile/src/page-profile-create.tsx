import { Cmd } from '@gamezilla/core';
import { ProfileAvatar, Route, UserId, Username } from '@gamezilla/shared';
import * as UI from '@gamezilla/shared/ui';
import { Button, FillBox, Header } from '@gamezilla/shared/ui';
import * as ProfileStore from './profile-store';

//
//
//
//
// Model
//
//
//
//

export type Model = {
  username: string;
  avatarUrl: string;
};

export const init = ({ defaultName }: { defaultName: string }): Model => {
  const username = defaultName.replace(' ', '').toLowerCase();
  return {
    username,
    avatarUrl: ProfileAvatar.toUrl({
      seed: ProfileAvatar.toSeed(username),
      style: 'big-ears-neutral',
    }),
  };
};

//
//
//
//
// Update
//
//
//
//

export type Msg =
  | ['inputted-username', string]
  | ['clicked-submit']
  | ['clicked-logout'];

export type OutAction = ProfileStore.Action;

export const update = (
  { userId }: { userId: UserId },
  msg: Msg,
  model: Model
): [Model, Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case 'inputted-username':
      return [{ ...model, username: msg[1] }, Cmd.None, []];

    case 'clicked-submit': {
      const avatarUrl = ProfileAvatar.toUrl({
        seed: ProfileAvatar.toSeed(model.username),
        style: 'adventurer-neutral',
      });

      const username = Username.decode(model.username);

      if (username.type === 'Err') {
        // todo handle validation error
        return [model, Cmd.None, []];
      }

      const profile: ProfileStore.Profile = {
        name: '',
        username: username.value,
        userId,
        avatarUrl,
        themeMode: 'System',
      };

      return [model, Cmd.None, [['profile', ['create-one', { profile }]]]];
    }

    case 'clicked-logout':
      return [model, Route.push(['logout']), []];
  }
};

//
//
//
//
// View
//
//
//
//

export const View = ({
  model,
  $send,
}: {
  model: Model;
  $send: (msg: Msg) => void;
}) => (
  <FillBox>
    <Header
      left={
        <Button
          sx={{ marginLeft: -1 }}
          size="small"
          onClick={() => $send(['clicked-logout'])}
        >
          Logout
        </Button>
      }
      title="Create Profile"
    />

    <UI.Box sx={{ p: 2, width: '100%' }}>
      <UI.Avatar
        src={model.avatarUrl}
        sx={{
          marginX: 'auto',
          width: '120px',
          height: '120px',
          marginBottom: 1,
        }}
      />

      <UI.Button
        sx={{
          display: 'block',
          marginX: 'auto',
          marginBottom: 2,
        }}
      >
        Change Avatar
      </UI.Button>

      <UI.TextField
        autoFocus
        type="text"
        value={model.username}
        sx={{ marginBottom: 2 }}
        label="Username"
        fullWidth
        onChange={(event) =>
          $send(['inputted-username', event.currentTarget.value])
        }
      />

      <UI.Button
        fullWidth
        size="large"
        variant="contained"
        onClick={() => $send(['clicked-submit'])}
      >
        Create Profile
      </UI.Button>
    </UI.Box>
  </FillBox>
);
