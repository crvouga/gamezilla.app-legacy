import { Browser, Cmd, p, t, Task, Time, Unit } from '@gamezilla/core';
import { PhoneNumber, Route } from '@gamezilla/shared';
import {
  Alert,
  Box,
  Button,
  FillBox,
  Header,
  TextField,
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
  code: string;
  submission:
    | {
        type: 'idle';
      }
    | {
        type: 'Loading';
      }
    | {
        type: 'Problem';
        message: string;
      }
    | {
        type: 'Ok';
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
      Cmd.perform(t('focus-done'))
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
  | ['clicked-back']
  | ['clicked-verify-code']
  | ['inputted-code', string]
  | ['verify-code-done', Auth.AuthResult]
  | ['focus-done', Browser.FocusResult];

export const update = ({
  phoneNumber,
  msg,
  model,
}: {
  phoneNumber: PhoneNumber;
  msg: Msg;
  model: Model;
}): { model: Model; cmd?: Cmd<Msg> } => {
  switch (msg[0]) {
    case 'clicked-back': {
      return { model, cmd: Route.back };
    }

    case 'clicked-verify-code': {
      return {
        model: {
          code: model.code,
          submission: { type: 'Loading' },
        },
        cmd: p(
          Auth.verifyCode({ code: model.code, phoneNumber }),
          Cmd.perform((result): Msg => ['verify-code-done', result])
        ),
      };
    }

    case 'inputted-code': {
      return { model: { ...model, code: msg[1] } };
    }

    case 'verify-code-done': {
      const result = msg[1];

      if (result.type === 'Err') {
        return {
          model: {
            code: '',
            submission: { type: 'Problem', message: result.error.message },
          },
          cmd: p(Browser.focus(codeInputId), Cmd.perform(t('focus-done'))),
        };
      }

      return {
        model: {
          ...model,
          submission: { type: 'Ok' },
        },
      };
    }

    case 'focus-done': {
      return { model };
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
  phoneNumber,
  model,
  $send,
}: {
  phoneNumber: PhoneNumber;
  model: Model;
  $send: (msg: Msg) => void;
}) => {
  return (
    <FillBox>
      <Header
        left={
          <Button
            sx={{ marginLeft: -1 }}
            onClick={() => $send(['clicked-back'])}
          >
            Cancel
          </Button>
        }
        title="Verify Code"
      />
      <Box
        sx={{
          padding: 2,
        }}
      >
        <Alert severity="info" sx={{ marginBottom: 2 }}>
          The code was sent to {PhoneNumber.format(phoneNumber)}.
        </Alert>
        <TextField
          id={codeInputId}
          autoFocus
          sx={{ marginBottom: 2 }}
          type="tel"
          fullWidth
          inputMode="tel"
          label="Code"
          value={model.code}
          onChange={(e) => $send(['inputted-code', e.target.value])}
          // helperText={`The code was sent to ${PhoneNumber.format(phoneNumber)}`}
        />

        <Button
          variant="contained"
          size="large"
          fullWidth
          loading={model.submission.type === 'Loading'}
          onClick={() => $send(['clicked-verify-code'])}
        >
          Verify Code
        </Button>

        {model.submission.type === 'Problem' && (
          <Alert severity="error" sx={{ marginTop: 2 }}>
            {model.submission.message}
          </Alert>
        )}
      </Box>
    </FillBox>
  );
};
