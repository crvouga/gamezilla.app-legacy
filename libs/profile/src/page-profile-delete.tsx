import { Cmd, RemoteData } from '@gamezilla/core';
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

export type Model = null;

export const init: [Model, Cmd<Msg>, OutAction[]] = [null, Cmd.None, []];

//
//
//
// Update
//
//
//

export type Msg =
  | ['clicked-cancel']
  | ['clicked-backdrop']
  | ['clicked-delete']
  | ['ClickedCloseErr'];

export type OutAction = ProfileStore.Action;

export const update = (
  { userId }: { userId: UserId },
  msg: Msg,
  model: Model
): [Model, Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case 'clicked-cancel':
      return [model, Route.back, []];

    case 'clicked-backdrop':
      return [model, Route.back, []];

    case 'clicked-delete':
      return [model, Cmd.None, [['profile', ['DeleteForever', { userId }]]]];

    case 'ClickedCloseErr':
      return [model, Cmd.None, [['profile', ['ResetMutations']]]];
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
  profileStore,
  userId,
  $send,
}: {
  profileStore: ProfileStore.Model;
  userId: UserId;
  model: Model;
  $send: (msg: Msg) => void;
}) => {
  const mutation = profileStore.deleteForever[userId] ?? RemoteData.NotAsked;

  switch (mutation.type) {
    case 'Loading':
      return <UI.LoadingDialog open title="Deleting profile..." />;

    case 'Err':
      return (
        <UI.Backdrop open>
          <UI.Alert variant="filled" severity="error" sx={{ margin: 2 }}>
            <UI.AlertTitle>Failed to delete profile.</UI.AlertTitle>
            {mutation.error}
            <UI.Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: 2,
              }}
            >
              <UI.Button
                variant="outlined"
                size="large"
                color="inherit"
                startIcon={<UI.Icons.Close />}
                onClick={() => $send(['ClickedCloseErr'])}
              >
                Close
              </UI.Button>
            </UI.Box>
          </UI.Alert>
        </UI.Backdrop>
      );

    case 'NotAsked':
    case 'Ok':
      return (
        <UI.ConformationDialog
          open
          title="Delete profile forever?"
          confirmTitle="Delete"
          onCancel={() => $send(['clicked-cancel'])}
          onClose={() => $send(['clicked-backdrop'])}
          onConfirm={() => $send(['clicked-delete'])}
        />
      );
  }
};
