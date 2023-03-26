import { Cmd } from '@gamezilla/core';
import { Route } from '@gamezilla/shared';
import * as UI from '@gamezilla/shared/ui';

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
  | ['clicked-logout']
  | ['clicked-delete-profile']
  | ['ClickedUpdateProfile'];

export const update = (msg: Msg, model: Model): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case 'clicked-back': {
      return [model, Route.back];
    }

    case 'clicked-delete-profile': {
      return [model, Route.push(['profile-delete'])];
    }

    case 'clicked-logout': {
      return [model, Route.push(['logout'])];
    }

    case 'ClickedUpdateProfile': {
      return [model, Route.push(['profile-update'])];
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

export const View = ({
  username,
  $send,
}: {
  username: string;
  $send: (msg: Msg) => void;
  model: Model;
}) => (
  <UI.FillBox>
    <UI.Header title={username} />

    <UI.List>
      <UI.ListItemButton onClick={() => $send(['ClickedUpdateProfile'])}>
        <UI.ListItemIcon>
          <UI.Icons.Edit />
        </UI.ListItemIcon>
        <UI.ListItemText primary="Update Profile" />
        <UI.ListItemSecondaryAction>
          <UI.Icons.ChevronRight />
        </UI.ListItemSecondaryAction>
      </UI.ListItemButton>

      <UI.ListItemButton onClick={() => $send(['clicked-delete-profile'])}>
        <UI.ListItemIcon>
          <UI.Icons.Delete />
        </UI.ListItemIcon>
        <UI.ListItemText primary="Delete Profile" />
      </UI.ListItemButton>

      <UI.ListItemButton onClick={() => $send(['clicked-logout'])}>
        <UI.ListItemIcon>
          <UI.Icons.Logout />
        </UI.ListItemIcon>
        <UI.ListItemText primary="Logout" />
      </UI.ListItemButton>
    </UI.List>
  </UI.FillBox>
);
