import { Iso3166Alpha2Code, PhoneNumber } from '@gamezilla/shared/app';
import { Browser, Cmd, Result, Task, p } from '@gamezilla/shared/core';
import { Route } from '@gamezilla/shared/frontend';
import {
  Autocomplete,
  IconPhone,
  IconSpinner,
  MyButton,
  MyTextField,
  TopBar,
  TopBarBackButton,
} from '@gamezilla/shared/ui';
import { matchSorter } from 'match-sorter';

//
//
//
// Model
//
//
//

export type Model = {
  phoneNumber: string;
  country: Iso3166Alpha2Code;
  countryQuery: string;
  validation:
    | 'not-validated'
    | 'invalid-phone-number'
    | 'empty-phone-number'
    | 'invalid-timezone';
  submission:
    | { type: 'idle' }
    | { type: 'Loading' }
    | { type: 'Problem'; message: string }
    | { type: 'Ok' };
};

export const init = (): {
  model: Model;
  cmd: Cmd<Msg>;
} => {
  return {
    model: {
      country: 'US',
      phoneNumber: '',
      countryQuery: Iso3166Alpha2Code.toName('US'),
      validation: 'not-validated',
      submission: {
        type: 'idle',
      },
    },
    cmd: p(
      Browser.focus('phone-number'),
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
  | { t: 'clicked-send-code' }
  | { t: 'inputted-phone-number'; phoneNumber: string }
  | {
      t: 'send-code-done';
      phoneNumber: PhoneNumber;
      result: Result<string, null>;
    }
  | { t: 'inputted-country'; country: Iso3166Alpha2Code }
  | { t: 'inputted-country-query'; value: string }
  | { t: 'focus-done'; result: Browser.FocusResult };

export const update = ({
  msg,
  model,
  sendCode,
}: {
  msg: Msg;
  model: Model;
  sendCode: (input: { phoneNumber: PhoneNumber }) => Task<Result<string, null>>;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.t === 'clicked-send-code') {
    if (model.phoneNumber.length === 0) {
      return { model: { ...model, validation: 'empty-phone-number' } };
    }

    const decoded = PhoneNumber.decode(model.country, model.phoneNumber);

    if (decoded.type === 'Err') {
      return { model: { ...model, validation: 'invalid-phone-number' } };
    }

    const phoneNumber = decoded.value;

    return {
      model: { ...model, submission: { type: 'Loading' } },
      cmd: p(
        sendCode({ phoneNumber: phoneNumber }),
        Cmd.perform(
          (result): Msg => ({ t: 'send-code-done', phoneNumber, result })
        )
      ),
    };
  }

  if (msg.t === 'clicked-back') {
    return { model, cmd: Route.back };
  }

  if (msg.t === 'inputted-country') {
    return {
      model: {
        ...model,
        country: msg.country,
        countryQuery: Iso3166Alpha2Code.toName(msg.country),
        validation: 'not-validated',
      },
    };
  }

  if (msg.t === 'inputted-phone-number') {
    return {
      model: {
        ...model,
        phoneNumber: msg.phoneNumber,
        validation: 'not-validated',
      },
    };
  }

  if (msg.t === 'send-code-done') {
    const { phoneNumber, result } = msg;

    if (result.type === 'Err') {
      return {
        model: {
          ...model,
          submission: { type: 'Problem', message: result.error },
        },
      };
    }

    return {
      model: { ...model, submission: { type: 'Ok' } },
      cmd: Route.push({
        t: 'auth',
        c: { t: 'login-phone-verify', phoneNumber: phoneNumber },
      }),
    };
  }

  if (msg.t === 'inputted-country-query') {
    return { model: { ...model, countryQuery: msg.value } };
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

const allOptions = Iso3166Alpha2Code.all.map((country) => ({
  value: country,
  name: Iso3166Alpha2Code.toName(country),
}));

export const View = ({
  model,
  $send,
}: {
  model: Model;
  $send: (msg: Msg) => void;
}) => {
  const filteredOptions = matchSorter(allOptions, model.countryQuery, {
    keys: ['value', 'name'],
  }).map((option) => option.value);
  return (
    <div className="flex-1 w-full">
      <TopBar
        left={<TopBarBackButton onClick={() => $send({ t: 'clicked-back' })} />}
        title="Login With Phone"
      />

      <form
        className="p-4 flex gap-4 flex-col"
        onSubmit={(e) => {
          e.preventDefault();
          $send({ t: 'clicked-send-code' });
        }}
      >
        <Autocomplete
          label="Country"
          startIcon={
            <span className="ml-2" role="img" aria-describedby="flag">
              {Iso3166Alpha2Code.toEmoji(model.country)}
            </span>
          }
          value={model.country}
          onChange={(country) => $send({ t: 'inputted-country', country })}
          onClear={() => $send({ t: 'inputted-country-query', value: '' })}
          options={filteredOptions}
          onChangeQuery={(value) =>
            $send({ t: 'inputted-country-query', value })
          }
          toKey={(x) => x}
          toLabel={(x) => Iso3166Alpha2Code.toNameWithEmoji(x)}
          valueQuery={model.countryQuery}
          className="w-full"
        />

        <MyTextField
          id="phone-number"
          startIcon={
            <IconPhone className="w-6 h-6 mr-2 opacity-80 text-inherit" />
          }
          label="Phone Number"
          onChange={(phoneNumber) =>
            $send({
              t: 'inputted-phone-number',
              phoneNumber: phoneNumber.replace(/\D/g, ''),
            })
          }
          onClear={() => $send({ t: 'inputted-phone-number', phoneNumber: '' })}
          type="tel"
          value={model.phoneNumber.replace(/\D/g, '')}
          error={
            model.validation === 'invalid-phone-number' ||
            model.validation === 'empty-phone-number'
          }
          helperText={
            model.validation === 'invalid-phone-number'
              ? 'Invalid phone number'
              : model.validation === 'empty-phone-number'
              ? 'Phone number is required'
              : undefined
          }
        />

        <MyButton
          type="submit"
          variant="contained"
          color="primary"
          size="lg"
          className="w-full mt-2"
        >
          {model.submission.type === 'Loading' && (
            <IconSpinner className="w-6 h-6 animate-spin" />
          )}
          Send Code
        </MyButton>

        {model.submission.type === 'Problem' && (
          <div className="bg-red-500 text-white p-4 mt-2 rounded-md">
            {model.submission.message}
          </div>
        )}
      </form>
    </div>
  );
};
