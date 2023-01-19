import { Cmd } from '@gamezilla/core';
import { Route } from '@gamezilla/shared';
import * as UI from '@gamezilla/ui';
import * as ProfileStore from './profile.store';

//
//
//
// Model
//
//
//

export type Model = null;

export const init: Model = null;

//
//
//
// Update
//
//
//

export type Msg =
  | ['ClickedBack']
  | ['ClickedName']
  | ['ClickedUsername']
  | ['ClickedAvatar']
  | ['ClickedChangedAvatar']
  | ['ClickedTheme'];

export const update = (msg: Msg, model: Model): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case 'ClickedAvatar':
      return [model, Route.push(['ProfileUpdateAvatar'])];

    case 'ClickedChangedAvatar':
      return [model, Route.push(['ProfileUpdateAvatar'])];

    case 'ClickedBack':
      return [model, Route.back];

    case 'ClickedName':
      return [model, Route.push(['ProfileUpdateName'])];

    case 'ClickedUsername':
      return [model, Route.push(['ProfileUpdateUsername'])];

    case 'ClickedTheme':
      return [model, Route.push(['ProfileUpdateTheme'])];
  }
};

//
//
//
// View
//
//
//

export const View = ({
  profile,
  $send,
}: {
  profile: ProfileStore.Profile;
  model: Model;
  $send: (msg: Msg) => void;
}) => (
  <UI.FillBox>
    <UI.Header
      left={<UI.HeaderBackButton onClick={() => $send(['ClickedBack'])} />}
      title="Update Profile"
    />

    <UI.Avatar
      src={profile.avatarUrl}
      sx={{
        marginX: 'auto',
        width: '150px',
        height: '150px',
        marginBottom: 1,
      }}
      onClick={() => $send(['ClickedAvatar'])}
    />

    <UI.Button
      sx={{ display: 'block', marginX: 'auto', marginBottom: 2 }}
      onClick={() => $send(['ClickedChangedAvatar'])}
    >
      Change Avatar
    </UI.Button>

    <UI.List>
      <UI.Field
        label="Username"
        value={profile.username}
        onClick={() => $send(['ClickedUsername'])}
      />

      {/* <UI.Field
        label="Name"
        value={profile.name}
        onClick={() => $send(["ClickedName"])}
      /> */}

      <UI.Field
        label="Theme"
        value={profile.themeMode}
        onClick={() => $send(['ClickedTheme'])}
      />
    </UI.List>
  </UI.FillBox>
);
