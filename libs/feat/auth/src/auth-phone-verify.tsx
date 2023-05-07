import { PhoneNumber } from '@gamezilla/shared';
import {
  Browser,
  Cmd,
  p,
  Result,
  Task,
  Time,
  Unit,
} from '@gamezilla/shared/core';
import { Route } from '@gamezilla/shared/frontend';
import {
  AlertError,
  AlertSuccess,
  IconSpinner,
  MyButton,
  MyTextField,
  TopBar,
  TopBarBackButton,
} from '@gamezilla/shared/ui';

//
//
//
// Model
//
//
//

export type Model = {
  code: string;
  submission:
    | {
        type: 'idle';
      }
    | {
        type: 'loading';
      }
    | {
        type: 'problem';
        message: string;
      }
    | {
        type: 'ok';
      };
};

const codeInputId = 'codeInputId';

export const init = (): { model: Model; cmd: Cmd<Msg> } => {
  return {
    model: {
      code: '',
      submission: { type: 'idle' },
    },
    cmd: p(
      Time.delay(100, () => Unit),
      Task.chain(() => Browser.focus(codeInputId)),
      Cmd.perform((result) => ({ t: 'focus-done', result }))
    ),
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
  | { t: 'clicked-back' }
  | { t: 'clicked-verify-code' }
  | { t: 'inputted-code'; code: string }
  | { t: 'verify-code-done'; result: Result<string, null> }
  | { t: 'focus-done'; result: Browser.FocusResult };

export const update = ({
  phoneNumber,
  msg,
  model,
  verifyCode,
}: {
  phoneNumber: PhoneNumber;
  msg: Msg;
  model: Model;
  verifyCode: (input: {
    code: string;
    phoneNumber: PhoneNumber;
  }) => Task<Result<string, null>>;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.t === 'clicked-back') {
    return { model, cmd: Route.back };
  }

  if (msg.t === 'clicked-verify-code') {
    return {
      model: {
        code: model.code,
        submission: { type: 'loading' },
      },
      cmd: p(
        verifyCode({ code: model.code, phoneNumber }),
        Cmd.perform((result): Msg => ({ t: 'verify-code-done', result }))
      ),
    };
  }

  if (msg.t === 'inputted-code') {
    return { model: { ...model, code: msg.code } };
  }

  if (msg.t === 'verify-code-done') {
    const result = msg.result;

    if (result.type === 'Ok') {
      return {
        model: {
          code: model.code,
          submission: { type: 'ok' },
        },
        cmd: Route.replace({ t: 'room', c: { t: 'room-list' } }),
      };
    }

    return {
      model: {
        code: model.code,
        submission: { type: 'problem', message: result.error },
      },
    };
  }

  if (msg.t === 'focus-done') {
    return { model };
  }

  return { model };
};

//
//
//
// View
//
//
//

export const View = ({
  phoneNumber,
  model,
  $send,
}: {
  phoneNumber: PhoneNumber;
  model: Model;
  $send: (msg: Msg) => void;
}) => {
  return (
    <div className="w-full h-full flex flex-col">
      <TopBar
        left={<TopBarBackButton onClick={() => $send({ t: 'clicked-back' })} />}
        title="Verify Code"
      />
      <div className="p-4 flex flex-col w-full gap-4">
        <AlertSuccess>
          <p className="font-light flex items-center flex-wrap gap-1">
            The code was sent to
            <span className="font-semibold inline-block">
              {PhoneNumber.format(phoneNumber)}.
            </span>
          </p>
        </AlertSuccess>

        <MyTextField
          id={codeInputId}
          startIcon
          autoFocus
          type="tel"
          label="Code"
          value={model.code}
          onChange={(code) => $send({ t: 'inputted-code', code })}
          onClear={() => $send({ t: 'inputted-code', code: '' })}
        />

        <MyButton
          variant="contained"
          size="lg"
          className="w-full"
          color="primary"
          onClick={() => $send({ t: 'clicked-verify-code' })}
        >
          {model.submission.type === 'loading' && <IconSpinner />}
          Verify Code
        </MyButton>

        {model.submission.type === 'problem' && (
          <AlertError className="mt-4">{model.submission.message}</AlertError>
        )}
      </div>
    </div>
  );
};
