import { Cmd, p } from '@gamezilla/core';
import { Route } from '@gamezilla/shared';
import {
  IconEnvelope,
  IconGoogle,
  IconMobilePhone,
  IconSpinner,
  MyButton,
} from '@gamezilla/shared/ui';
import { AuthResult, loginWithProvider } from '../auth';

export type Model = 'idle' | 'signing-in-with-google';

export const init: Model = 'idle';

export type Msg =
  | { t: 'clicked-email' }
  | { t: 'clicked-text' }
  | { t: 'clicked-google' }
  | { t: 'login-done'; result: AuthResult };

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
  if (msg.t === 'clicked-email') {
    return { model, cmd: Route.push(['login-email-link']) };
  }

  if (msg.t === 'clicked-text') {
    return {
      model,
      cmd: Route.push(['login-phone', { isSelectingCountry: false }]),
    };
  }

  if (msg.t === 'clicked-google') {
    return {
      model: 'signing-in-with-google',
      cmd: p(
        loginWithProvider({ provider: 'Google' }),
        Cmd.perform((result) => ({ t: 'login-done', result }))
      ),
    };
  }

  return { model };
};

export const View = ({
  model,
  $send,
}: {
  model: Model;
  $send: (msg: Msg) => void;
}) => {
  return (
    <div className="w-full h-full flex-1 flex flex-col">
      <div className="flex-1 flex flex-col justify-center items-center p-4 gap-8">
        <div className="w-full flex flex-col items-start justify-center">
          <p className="text-2xl">Sign in to</p>
          <h1 className="bg-gradient-to-b from-blue-400 to-blue-600 text-transparent bg-clip-text text-5xl font-extrabold pb-2">
            gamezilla.app
          </h1>
        </div>

        <div className="flex flex-col gap-6 w-full">
          {/* <MyButton
            onClick={() => $send({ t: 'clicked-google' })}
            size="lg"
            className="w-full"
          >
            {model === 'signing-in-with-google' && (
              <IconSpinner className="animate-spin" />
            )}
            <IconGoogle />
            Continue With Google
          </MyButton> */}

          <MyButton
            onClick={() => $send({ t: 'clicked-text' })}
            size="lg"
            className="w-full"
          >
            <IconMobilePhone />
            Continue With Text
          </MyButton>

          {/* <MyButton
            onClick={() => $send({ t: 'clicked-email' })}
            size="lg"
            className="w-full"
          >
            <IconEnvelope />
            Continue With Email
          </MyButton> */}
        </div>
      </div>
    </div>
  );
};
