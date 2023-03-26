import { Cmd } from '@gamezilla/core';
import { Route } from '@gamezilla/temp-shared';
import * as UI from '@gamezilla/temp-shared/ui';
import * as Auth from './auth';

//
//
//
// Model
//
//
//

export type Model = { type: 'idle' } | { type: 'LoggingOut' };

export const init: Model = { type: 'idle' };

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
  | ['clicked-logout'];

type OutAction = Auth.Action;

export const update = (
  msg: Msg,
  model: Model
): [Model, Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case 'clicked-cancel':
      return [model, Route.back, []];

    case 'clicked-backdrop':
      return [model, Route.back, []];

    case 'clicked-logout':
      return [{ type: 'LoggingOut' }, Cmd.None, [['auth', ['logout']]]];
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
}) => {
  switch (model.type) {
    case 'idle': {
      return (
        <UI.ConformationDialog
          open={model.type === 'idle'}
          title="Logout of Gamezilla?"
          confirmTitle="Logout"
          onConfirm={() => $send(['clicked-logout'])}
          onClose={() => $send(['clicked-backdrop'])}
          onCancel={() => $send(['clicked-cancel'])}
        />
      );
    }

    case 'LoggingOut': {
      return (
        <UI.LoadingDialog
          open={model.type === 'LoggingOut'}
          title={'Logging out...'}
        />
      );
    }
  }
};
