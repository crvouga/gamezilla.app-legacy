import { Cmd, p } from '@gamezilla/core';
import { Route } from '@gamezilla/shared';
import * as UI from '@gamezilla/shared/ui';
import * as AccountStore from './account.store';

//
//
//
// Model
//
//
//

export type Model = {
  emailAddress: string;
  submission:
    | { type: 'Idle' }
    | { type: 'Loading' }
    | { type: 'Problem'; message: string }
    | { type: 'Succeeded'; sentTo: string };
};

//
//
//
// Init
//
//
//

export const init: Model = {
  submission: { type: 'Idle' },
  emailAddress: '',
};

//
//
//
// Update
//
//
//

export type Msg =
  | ['ClickedBack']
  | ['ClickedSend']
  | ['InputtedEmailAddress', string]
  | [
      'Send_Done',
      {
        sentTo: string;
        result: AccountStore.SendResetPasswordLinkResult;
      }
    ];

export const update = (msg: Msg, model: Model): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case 'ClickedBack':
      return [model, Route.back];

    case 'InputtedEmailAddress':
      return [{ ...model, emailAddress: msg[1] }, Cmd.None];

    case 'ClickedSend':
      return [
        { ...model, submission: { type: 'Loading' } },
        p(
          AccountStore.sendResetPasswordLink({
            emailAddress: model.emailAddress,
          }),
          Cmd.perform((result) => [
            'Send_Done',
            {
              sentTo: model.emailAddress,
              result,
            },
          ])
        ),
      ];

    case 'Send_Done': {
      const result = msg[1].result;
      switch (result.type) {
        case 'Err':
          return [
            {
              ...model,
              submission: {
                type: 'Problem',
                message: result.error,
              },
            },
            Cmd.None,
          ];

        case 'Ok':
          return [
            {
              ...model,
              submission: {
                type: 'Succeeded',
                sentTo: msg[1].sentTo,
              },
            },
            Cmd.None,
          ];
      }
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
}) => {
  return (
    <UI.FillBox>
      <UI.Header
        left={<UI.HeaderBackButton onClick={() => $send(['ClickedBack'])} />}
        title="Reset Password"
      />

      <UI.Box
        sx={{
          padding: 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          flex: 1,
        }}
      >
        <UI.TextField
          autoFocus
          sx={{ marginBottom: 2 }}
          type="email"
          fullWidth
          inputMode="email"
          label="Email Address"
          value={model.emailAddress}
          onChange={(event) => {
            $send(['InputtedEmailAddress', event.target.value]);
          }}
        />

        <UI.Button
          variant="contained"
          size="large"
          fullWidth
          loading={model.submission.type === 'Loading'}
          onClick={() => $send(['ClickedSend'])}
        >
          Send Password Reset Link
        </UI.Button>

        {model.submission.type === 'Problem' && (
          <UI.Alert severity="error" sx={{ marginTop: 2 }}>
            {model.submission.message}
          </UI.Alert>
        )}
        {model.submission.type === 'Succeeded' && (
          <UI.Alert severity="success" sx={{ marginTop: 2 }}>
            Password reset link was sent to {model.submission.sentTo}
          </UI.Alert>
        )}
        <UI.Box sx={{ flex: 1 }} />
      </UI.Box>
    </UI.FillBox>
  );
};
