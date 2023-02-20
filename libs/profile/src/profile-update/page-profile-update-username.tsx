import { Cmd } from '@gamezilla/core';
import { Route, UserId, Username } from '@gamezilla/shared';
import { Box, Button, FillBox, Header, TextField } from '@gamezilla/shared/ui';
import * as ProfileStore from '../profile-store';

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
  | ['clicked-cancel']
  | ['clicked-submit']
  | ['inputted-username', string];

type OutAction = ProfileStore.Action;

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
    case 'inputted-username':
      return { model: { ...model, username: msg[1] } };

    case 'clicked-cancel':
      return { model, cmd: Route.back };

    case 'clicked-submit': {
      const username = Username.decode(model.username);

      if (username.type === 'Err') {
        return { model };
      }

      return {
        model,
        cmd: Route.back,
        actions: [
          [
            'profile',
            [
              'edit-one',
              { userId: currentUserId, edits: { username: username.value } },
            ],
          ],
        ],
      };
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
      title="Username"
      right={
        <Button
          sx={{ marginRight: -1 }}
          onClick={() => $send(['clicked-submit'])}
        >
          Done
        </Button>
      }
    />

    <Box sx={{ p: 2, width: '100%' }}>
      <TextField
        value={model.username}
        sx={{ marginBottom: 4 }}
        label="Username"
        fullWidth
        onChange={(event) =>
          $send(['inputted-username', event.currentTarget.value])
        }
      />
    </Box>
  </FillBox>
);
