import { Browser, Cmd, exhaustive, p } from '@gamezilla/core';
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

export type Model = {
  emailAddress: string;
  password: string;
  passwordVisibility: Visibility;
  submission:
    | { type: 'Idle' }
    | { type: 'Loading' }
    | { type: 'Problem'; message: string };
};

type Visibility = 'Showing' | 'Hiding';

//
//
//
// Init
//
//
//

export const init: Model = {
  submission: { type: 'Idle' },
  passwordVisibility: 'Hiding',
  emailAddress: '',
  password: '',
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
  | ['ClickedTogglePasswordVisibility']
  | ['ClickedLogin']
  | ['ClickedCreateAccount']
  | ['ClickedResetPassword']
  | ['inputted-email-address', string]
  | ['InputtedPassword', string]
  | ['focus-done', Browser.FocusResult]
  | ['login-done', Auth.AuthResult];

const passwordFieldId = 'password';

export const update = (msg: Msg, model: Model): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case 'inputted-email-address': {
      return [{ ...model, emailAddress: msg[1] }, Cmd.None];
    }

    case 'InputtedPassword': {
      return [{ ...model, password: msg[1] }, Cmd.None];
    }

    case 'ClickedTogglePasswordVisibility': {
      return [
        {
          ...model,
          passwordVisibility: toggleVisibility(model.passwordVisibility),
        },
        p(
          Browser.focus(passwordFieldId),
          Cmd.perform((result) => ['focus-done', result])
        ),
      ];
    }

    case 'focus-done': {
      return [model, Cmd.None];
    }

    case 'ClickedLogin': {
      return [
        {
          ...model,
          submission: { type: 'Loading' },
        },
        p(
          Auth.loginWithEmailAndPassword({
            emailAddress: model.emailAddress,
            password: model.password,
          }),
          Cmd.perform((result) => ['login-done', result])
        ),
      ];
    }

    case 'login-done': {
      switch (msg[1].type) {
        case 'Err':
          return [
            {
              ...model,
              submission: {
                type: 'Problem',
                message: msg[1].error.message,
              },
            },
            Cmd.None,
          ];

        case 'Ok':
          return [model, Cmd.None];

        default:
          return [model, Cmd.None];
      }
    }

    case 'ClickedCreateAccount': {
      return [model, Cmd.None];
    }
    // return [model, Route.push(["AccountCreate"])]

    case 'ClickedResetPassword':
      return [model, Cmd.None];
    // return [model, Route.push(["PasswordReset"])]

    case 'clicked-back':
      return [model, Route.back];

    default:
      return exhaustive(msg[0]);
  }
};

const toggleVisibility = (visibility: Visibility): Visibility => {
  switch (visibility) {
    case 'Hiding':
      return 'Showing';

    case 'Showing':
      return 'Hiding';
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
        title="Continue With Email"
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
            $send(['inputted-email-address', event.target.value]);
          }}
        />

        <UI.TextField
          sx={{ marginBottom: 2 }}
          id={passwordFieldId}
          type={model.passwordVisibility === 'Hiding' ? 'password' : 'text'}
          fullWidth
          label="Password"
          value={model.password}
          onChange={(event) => {
            $send(['InputtedPassword', event.target.value]);
          }}
          InputProps={{
            endAdornment: (
              <UI.InputAdornment position="end">
                <UI.Button
                  onClick={() => $send(['ClickedTogglePasswordVisibility'])}
                >
                  {model.passwordVisibility === 'Hiding' ? 'Show' : 'Hide'}
                </UI.Button>
              </UI.InputAdornment>
            ),
          }}
        />

        <UI.Button
          variant="contained"
          size="large"
          fullWidth
          loading={model.submission.type === 'Loading'}
          onClick={() => $send(['ClickedLogin'])}
        >
          Login
        </UI.Button>

        {model.submission.type === 'Problem' && (
          <UI.Alert severity="error" sx={{ marginTop: 2 }}>
            {model.submission.message}
          </UI.Alert>
        )}

        <UI.Box sx={{ flex: 1 }} />

        <UI.Typography align="center" color="text.secondary">
          Don't have an account?
        </UI.Typography>

        <UI.Button
          sx={{ marginBottom: 2 }}
          onClick={() => $send(['ClickedCreateAccount'])}
        >
          Create Account
        </UI.Button>
        <UI.Typography align="center" color="text.secondary">
          Forgot password?
        </UI.Typography>

        <UI.Button onClick={() => $send(['ClickedResetPassword'])}>
          Reset Password
        </UI.Button>
      </UI.Box>
    </UI.FillBox>
  );
};
