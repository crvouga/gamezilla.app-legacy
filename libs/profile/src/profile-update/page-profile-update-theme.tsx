import { Cmd } from '@gamezilla/core';
import { Route, UserId } from '@gamezilla/shared';
import {
  FillBox,
  Header,
  HeaderBackButton,
  LoadingDialog,
  ThemeModeToggleButtons,
} from '@gamezilla/shared/ui';
import { Box } from '@mui/material';
import * as ProfileStore from '../profile-store';

//
//
//
// Model
//
//
//

export type Model = { status: 'idle' | 'Updating' };

export const init: Model = {
  status: 'idle',
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
  | ['clicked-theme-mode', ProfileStore.Profile['themeMode']];

type Action = ProfileStore.Action;

export const update = ({
  msg,
  model,
  currentUserId,
}: {
  currentUserId: UserId;
  msg: Msg;
  model: Model;
}): { model: Model; cmd?: Cmd<Msg>; actions?: Action[] } => {
  switch (msg[0]) {
    case 'clicked-back':
      return { model, cmd: Route.back };

    case 'clicked-theme-mode':
      return {
        model,
        actions: [
          [
            'profile',
            [
              'EditOne',
              { userId: currentUserId, edits: { themeMode: msg[1] } },
            ],
          ],
        ],
      };
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
  <FillBox>
    <Header
      left={<HeaderBackButton onClick={() => $send(['clicked-back'])} />}
      title="Theme"
    />

    <LoadingDialog
      open={model.status === 'Updating'}
      title="Updating theme..."
    />

    <Box sx={{ padding: 2 }}>
      <ThemeModeToggleButtons
        themeMode={profile.themeMode}
        onChange={(themeMode) => $send(['clicked-theme-mode', themeMode])}
      />
    </Box>
  </FillBox>
);
