import { Cmd } from '@gamezilla/core';
import { Route, UserId } from '@gamezilla/shared';
import * as UI from '@gamezilla/shared/ui';
import * as ProfileStore from './profile-store';

//
//
//
// Model
//
//
//

export type Model = { status: 'Idle' | 'Updating' };

export const init: Model = {
  status: 'Idle',
};

//
//
//
// Update
//
//
//

export type Msg =
  | ['clicked-back']
  | ['ClickedThemeMode', ProfileStore.Profile['themeMode']];

type OutMsg = ProfileStore.Action;

export const update = (
  { userId }: { userId: UserId },
  msg: Msg,
  model: Model
): [Model, Cmd<Msg>, OutMsg[]] => {
  switch (msg[0]) {
    case 'clicked-back':
      return [model, Route.back, []];

    case 'ClickedThemeMode':
      return [
        model,
        Cmd.None,
        [['profile', ['EditOne', { userId, edits: { themeMode: msg[1] } }]]],
      ];
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
  model,
  $send,
}: {
  profile: ProfileStore.Profile;
  model: Model;
  $send: (msg: Msg) => void;
}) => (
  <UI.FillBox>
    <UI.Header
      left={<UI.HeaderBackButton onClick={() => $send(['clicked-back'])} />}
      title="Theme"
    />

    <UI.LoadingDialog
      open={model.status === 'Updating'}
      title="Updating theme..."
    />

    <UI.Box sx={{ padding: 2 }}>
      <UI.ThemeModeToggleButtons
        themeMode={profile.themeMode}
        onChange={(themeMode) => $send(['ClickedThemeMode', themeMode])}
      />
    </UI.Box>
  </UI.FillBox>
);
