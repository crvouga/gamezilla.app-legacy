import { Cmd } from '@gamezilla/core';
import { Route, UserId } from '@gamezilla/shared';
import * as UI from '@gamezilla/ui';
import * as ProfileStore from './profile.store';

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
  | ['InputtedName', string]
  | ['ClickedCancel']
  | ['ClickedSubmit'];

export type OutAction = ProfileStore.Action;

export const update = (
  { userId }: { userId: UserId },
  msg: Msg,
  model: Model
): [Model, Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case 'InputtedName':
      return [{ ...model, name: msg[1] }, Cmd.None, []];

    case 'ClickedSubmit':
      return [
        model,
        Route.back,
        [['Profile', ['EditOne', { userId, edits: { name: model.name } }]]],
      ];

    case 'ClickedCancel':
      return [model, Route.back, []];
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
      title="Name"
      right={
        <UI.Button
          sx={{ marginRight: -1 }}
          onClick={() => $send(['ClickedSubmit'])}
        >
          Done
        </UI.Button>
      }
    />

    <UI.Box sx={{ padding: 2 }}>
      <UI.TextField
        value={model.name}
        sx={{ marginBottom: 4 }}
        label="Name"
        fullWidth
        onChange={(event) => $send(['InputtedName', event.currentTarget.value])}
      />
    </UI.Box>
  </UI.FillBox>
);
