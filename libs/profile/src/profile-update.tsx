import { Cmd } from '@gamezilla/core';
import { Route } from '@gamezilla/shared';
import * as UI from '@gamezilla/shared/ui';
import * as ProfileStore from './profile-store';

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
  | ['clicked-back']
  | ['ClickedName']
  | ['clicked-username']
  | ['ClickedAvatar']
  | ['ClickedChangedAvatar']
  | ['ClickedTheme'];

export const update = (msg: Msg, model: Model): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case 'ClickedAvatar':
      return [model, Route.push(['profile-update-avatar'])];

    case 'ClickedChangedAvatar':
      return [model, Route.push(['profile-update-avatar'])];

    case 'clicked-back':
      return [model, Route.back];

    case 'ClickedName':
      return [model, Route.push(['profile-update-name'])];

    case 'clicked-username':
      return [model, Route.push(['profile-update-username'])];

    case 'ClickedTheme':
      return [model, Route.push(['profile-update-theme'])];
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
      left={<UI.HeaderBackButton onClick={() => $send(['clicked-back'])} />}
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
        onClick={() => $send(['clicked-username'])}
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
