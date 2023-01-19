import { Cmd } from '@gamezilla/core';
import { Route } from '@gamezilla/shared';
import * as UI from '@gamezilla/shared/ui';
import * as Auth from './auth';

//
//
//
// Model
//
//
//

export type Model = { type: 'Idle' } | { type: 'LoggingOut' };

export const init: Model = { type: 'Idle' };

//
//
//
// Update
//
//
//

export type Msg = ['ClickedCancel'] | ['ClickedBackdrop'] | ['ClickedLogout'];

type OutAction = Auth.Action;

export const update = (
  msg: Msg,
  model: Model
): [Model, Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case 'ClickedCancel':
      return [model, Route.back, []];

    case 'ClickedBackdrop':
      return [model, Route.back, []];

    case 'ClickedLogout':
      return [{ type: 'LoggingOut' }, Cmd.None, [['Auth', ['Logout']]]];
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
    case 'Idle': {
      return (
        <UI.ConformationDialog
          open={model.type === 'Idle'}
          title="Logout of Gamezilla?"
          confirmTitle="Logout"
          onConfirm={() => $send(['ClickedLogout'])}
          onClose={() => $send(['ClickedBackdrop'])}
          onCancel={() => $send(['ClickedCancel'])}
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
