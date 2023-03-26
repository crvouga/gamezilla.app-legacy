import { Cmd, RemoteData } from '@gamezilla/core';
import { Ctx, Route, UserId } from '@gamezilla/temp-shared';
import * as UI from '@gamezilla/temp-shared/ui';
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
  | ['clicked-close-error'];

export type OutAction = ProfileStore.Action;

export const update = ({
  currentUserId,
  msg,
  model,
}: {
  currentUserId: UserId;
  msg: Msg;
  model: Model;
}): [Model, Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case 'clicked-cancel':
      return [model, Route.back, []];

    case 'clicked-backdrop':
      return [model, Route.back, []];

    case 'clicked-delete':
      return [
        model,
        Cmd.None,
        [['profile', ['delete-forever', { userId: currentUserId }]]],
      ];

    case 'clicked-close-error':
      return [model, Cmd.None, [['profile', ['reset-mutations']]]];
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
  $send,
  ctx,
}: {
  profileStore: ProfileStore.Model;
  ctx: Ctx;
  model: Model;
  $send: (msg: Msg) => void;
}) => {
  const mutation =
    profileStore.deleteForever[ctx.currentUserId] ?? RemoteData.NotAsked;

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
                onClick={() => $send(['clicked-close-error'])}
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
