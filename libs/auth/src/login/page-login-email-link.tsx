import { Cmd, exhaustive, p } from '@gamezilla/core';
import { Route } from '@gamezilla/shared';
import {
  AlertError,
  AlertSuccess,
  IconSpinner,
  MyButton,
  MyTextField,
  TopBar,
} from '@gamezilla/shared/ui';
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
  validation?: 'invalid-email' | null;
  submission:
    | { type: 'idle' }
    | { type: 'loading'; sentToEmailAddress: string }
    | { type: 'problem'; message: string }
    | { type: 'ok'; sentToEmailAddress: string };
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
  | { t: 'clicked-back' }
  | { t: 'clicked-send-login-link' }
  | { t: 'inputted-email-address'; emailAddress: string }
  | { t: 'login-done'; result: Auth.AuthResult };

export const update = ({
  msg,
  model,
}: {
  msg: Msg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.t === 'inputted-email-address') {
    return {
      model: { ...model, validation: null, emailAddress: msg.emailAddress },
    };
  }

  if (msg.t === 'login-done') {
    if (msg.result.type === 'Err') {
      return {
        model: {
          ...model,
          submission: {
            type: 'problem',
            message: msg.result.error.message,
          },
        },
      };
    }

    const emailAddress =
      model.submission.type === 'loading'
        ? model.submission.sentToEmailAddress
        : model.emailAddress;

    return {
      model: {
        ...model,
        emailAddress: '',
        submission: { type: 'ok', sentToEmailAddress: emailAddress },
      },
    };
  }

  if (msg.t === 'clicked-send-login-link') {
    if (model.emailAddress.length === 0) {
      return {
        model: {
          ...model,
          validation: 'invalid-email',
        },
      };
    }

    return {
      model: {
        ...model,
        submission: {
          type: 'loading',
          sentToEmailAddress: model.emailAddress,
        },
      },
      cmd: p(
        Auth.loginWithEmailLink({ emailAddress: model.emailAddress }),
        Cmd.perform((result) => ({ t: 'login-done', result }))
      ),
    };
  }

  if (msg.t === 'clicked-back') {
    return { model: model, cmd: Route.back };
  }

  return exhaustive(msg);
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
    <div className="w-full h-full flex flex-col">
      <TopBar
        left={
          <MyButton onClick={() => $send({ t: 'clicked-back' })}>Back</MyButton>
        }
        title="Login With Email"
      />

      <form
        className="p-4 flex flex-col gap-6"
        onSubmit={(event) => {
          event.preventDefault();
          $send({ t: 'clicked-send-login-link' });
        }}
      >
        <MyTextField
          autoFocus
          id="email-address"
          type="email"
          label="Email Address"
          value={model.emailAddress}
          onChange={(emailAddress) => {
            $send({ t: 'inputted-email-address', emailAddress });
          }}
          onClear={() =>
            $send({ t: 'inputted-email-address', emailAddress: '' })
          }
          error={model.validation === 'invalid-email'}
          helperText={
            model.validation === 'invalid-email'
              ? 'Please enter a valid email address'
              : undefined
          }
        />

        <MyButton
          variant="contained"
          size="lg"
          className="w-full"
          color="primary"
          type="submit"
        >
          {model.submission.type === 'loading' && <IconSpinner />}
          Send Login Link
        </MyButton>

        {model.submission.type === 'problem' && (
          <AlertError>{model.submission.message}</AlertError>
        )}

        {model.submission.type === 'ok' && (
          <AlertSuccess>
            <div className="flex flex-col gap-2">
              <div className="text-lg">Check your email</div>
              <div className="text-white/80">
                Login link was send to{' '}
                <span className="text-white">
                  {model.submission.sentToEmailAddress}
                </span>
              </div>
            </div>
          </AlertSuccess>
        )}
      </form>
    </div>
  );
};
