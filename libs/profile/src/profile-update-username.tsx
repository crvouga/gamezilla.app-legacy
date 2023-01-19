import { Cmd } from '@gamezilla/core';
import { Route, UserId, Username } from '@gamezilla/shared';
import * as UI from '@gamezilla/shared/ui';
import * as ProfileStore from './profile-.store';

//
//
//
// Model
//
//
//

export type Model = { username: string };

export const init = ({ username }: { username: string }): Model => {
  return {
    username,
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
  | ['ClickedCancel']
  | ['ClickedSubmit']
  | ['InputtedUsername', string];

type OutAction = ProfileStore.Action;

export const update = (
  { userId }: { userId: UserId },
  msg: Msg,
  model: Model
): [Model, Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case 'InputtedUsername':
      return [{ ...model, username: msg[1] }, Cmd.None, []];

    case 'ClickedCancel':
      return [model, Route.back, []];

    case 'ClickedSubmit': {
      const username = Username.decode(model.username);

      if (username.type === 'Err') {
        return [model, Cmd.None, []];
      }

      return [
        model,
        Route.back,
        [
          [
            'Profile',
            ['EditOne', { userId, edits: { username: username.value } }],
          ],
        ],
      ];
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
  model,
  $send,
}: {
  model: Model;
  $send: (msg: Msg) => void;
}) => (
  <UI.FillBox>
    <UI.Header
      left={
        <UI.Button
          sx={{ marginLeft: -1 }}
          onClick={() => $send(['ClickedCancel'])}
        >
          Cancel
        </UI.Button>
      }
      title="Username"
      right={
        <UI.Button
          sx={{ marginRight: -1 }}
          onClick={() => $send(['ClickedSubmit'])}
        >
          Done
        </UI.Button>
      }
    />

    <UI.Box sx={{ p: 2, width: '100%' }}>
      <UI.TextField
        value={model.username}
        sx={{ marginBottom: 4 }}
        label="Username"
        fullWidth
        onChange={(event) =>
          $send(['InputtedUsername', event.currentTarget.value])
        }
      />
    </UI.Box>
  </UI.FillBox>
);
