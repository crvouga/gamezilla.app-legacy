import { Cmd } from '@gamezilla/core';
import { Route, UserId } from '@gamezilla/shared';
import { Box, Button, FillBox, Header, TextField } from '@gamezilla/shared/ui';
import * as ProfileStore from '../profile-store';

//
//
//
// Model
//
//
//

export type Model = { name: string };

export const init = ({ name }: { name: string }): Model => {
  return {
    name,
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
  | ['inputted-name', string]
  | ['clicked-cancel']
  | ['clicked-submit'];

export type OutAction = ProfileStore.Action;

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
    case 'inputted-name':
      return { model: { ...model, name: msg[1] } };

    case 'clicked-submit':
      return {
        model,
        cmd: Route.back,
        actions: [
          [
            'profile',
            [
              'edit-one',
              { userId: currentUserId, edits: { name: model.name } },
            ],
          ],
        ],
      };

    case 'clicked-cancel':
      return { model, cmd: Route.back };
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
      title="Name"
      right={
        <Button
          sx={{ marginRight: -1 }}
          onClick={() => $send(['clicked-submit'])}
        >
          Done
        </Button>
      }
    />

    <Box sx={{ padding: 2 }}>
      <TextField
        value={model.name}
        sx={{ marginBottom: 4 }}
        label="Name"
        fullWidth
        onChange={(event) =>
          $send(['inputted-name', event.currentTarget.value])
        }
      />
    </Box>
  </FillBox>
);
