import { Cmd, exhaustive, p, t } from '@gamezilla/core';
import { Route } from '@gamezilla/shared';
import * as UI from '@gamezilla/shared/ui';
import * as Auth from '../auth';

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
    | { type: 'idle' }
    | { type: 'Loading'; sentToEmailAddress: string }
    | { type: 'Problem'; message: string }
    | { type: 'Ok'; sentToEmailAddress: string };
};

export const init: Model = {
  emailAddress: '',
  submission: { type: 'idle' },
};

//
//
//
// Update
//
//
//

export type Msg =
  | ['clicked-back']
  | ['clicked-send-login-link']
  | ['inputted-email-address', string]
  | ['login-done', Auth.AuthResult];

export const update = ({
  msg,
  model,
}: {
  msg: Msg;
  model: Model;
}): { model: Model; cmd?: Cmd<Msg> } => {
  switch (msg[0]) {
    case 'inputted-email-address':
      return { model: { ...model, emailAddress: msg[1] } };

    case 'login-done': {
      switch (msg[1].type) {
        case 'Err': {
          return {
            model: {
              ...model,
              submission: {
                type: 'Problem',
                message: msg[1].error.message,
              },
            },
          };
        }

        case 'Ok': {
          const emailAddress =
            model.submission.type === 'Loading'
              ? model.submission.sentToEmailAddress
              : model.emailAddress;
          return {
            model: {
              ...model,
              emailAddress: '',
              submission: { type: 'Ok', sentToEmailAddress: emailAddress },
            },
          };
        }
        default: {
          return { model };
        }
      }
    }

    case 'clicked-send-login-link': {
      return {
        model: {
          ...model,
          submission: {
            type: 'Loading',
            sentToEmailAddress: model.emailAddress,
          },
        },
        cmd: p(
          Auth.loginWithEmailLink({ emailAddress: model.emailAddress }),
          Cmd.perform(t('login-done'))
        ),
      };
    }

    case 'clicked-back': {
      return { model: model, cmd: Route.back };
    }

    default:
      return exhaustive(msg[0]);
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
        left={<UI.HeaderBackButton onClick={() => $send(['clicked-back'])} />}
        title="Login With Email"
      />

      <UI.Box
        sx={{
          padding: 2,
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
            $send(['inputted-email-address', event.target.value]);
          }}
        />

        <UI.Button
          variant="contained"
          size="large"
          fullWidth
          loading={model.submission.type === 'Loading'}
          onClick={() => $send(['clicked-send-login-link'])}
          sx={{ marginBottom: 2 }}
        >
          Send Login Link
        </UI.Button>

        {model.submission.type === 'Problem' && (
          <UI.Alert severity="error">{model.submission.message}</UI.Alert>
        )}

        {model.submission.type === 'Ok' && (
          <UI.Alert severity="success">
            <UI.AlertTitle>Check your email</UI.AlertTitle>
            <UI.Typography color="text.secondary" variant="body2">
              An email was sent to{' '}
              <UI.Box component="span" sx={{ color: 'text.primary' }}>
                {model.submission.type === 'Ok'
                  ? model.submission.sentToEmailAddress
                  : 'the provider email address'}
              </UI.Box>
              . It has a link that will log you in.
            </UI.Typography>
          </UI.Alert>
        )}
      </UI.Box>
    </UI.FillBox>
  );
};
