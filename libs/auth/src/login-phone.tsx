import { Cmd, p } from '@gamezilla/core';
import { Iso3166Alpha2Code, PhoneNumber } from '@gamezilla/shared';
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
  phoneNumber: string;
  country: Iso3166Alpha2Code;
  validation: 'NotChecked' | 'InvalidPhoneNumber' | 'EmptyPhoneNumber';
  submission:
    | { type: 'Idle' }
    | { type: 'Loading' }
    | { type: 'Problem'; message: string }
    | { type: 'Ok' };
};

export const init: Model = {
  country: 'US',
  phoneNumber: '',
  validation: 'NotChecked',
  submission: {
    type: 'Idle',
  },
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
  | ['clicked-send-code']
  | ['inputted-phone-number', string]
  | ['inputted-country', Iso3166Alpha2Code]
  | ['send-code-done', PhoneNumber, Auth.AuthResult];

export const update = (msg: Msg, model: Model): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case 'ClickedBack': {
      return [model, Route.back];
    }

    case 'clicked-send-code': {
      if (model.phoneNumber.length === 0) {
        return [{ ...model, validation: 'EmptyPhoneNumber' }, Cmd.None];
      }

      const decoded = PhoneNumber.decode(model.country, model.phoneNumber);

      if (decoded.type === 'Err') {
        return [{ ...model, validation: 'InvalidPhoneNumber' }, Cmd.None];
      }

      const phoneNumber = decoded.value;

      return [
        { ...model, submission: { type: 'Loading' } },
        p(
          Auth.sendCode({ phoneNumber: phoneNumber }),
          Cmd.perform((result): Msg => ['send-code-done', phoneNumber, result])
        ),
      ];
    }

    case 'inputted-phone-number': {
      return [
        { ...model, phoneNumber: msg[1], validation: 'NotChecked' },
        Cmd.None,
      ];
    }

    case 'inputted-country': {
      return [
        { ...model, country: msg[1], validation: 'NotChecked' },
        Cmd.None,
      ];
    }

    case 'send-code-done': {
      const phoneNumber = msg[1];
      const result = msg[2];

      if (result.type === 'Err') {
        return [
          {
            ...model,
            submission: { type: 'Problem', message: result.error.message },
          },
          Cmd.None,
        ];
      }

      return [
        { ...model, submission: { type: 'Ok' } },
        Route.push(['login-phone-verify', { phoneNumber: phoneNumber }]),
      ];
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
        title="Login With Phone"
      />
      <UI.Box
        sx={{
          padding: 2,
        }}
      >
        <UI.Autocomplete
          id="iso_3166_phone_number"
          multiple={false}
          defaultValue={Iso3166Alpha2Code.of('US')}
          options={Iso3166Alpha2Code.all}
          getOptionLabel={(option) => {
            if (!Iso3166Alpha2Code.is(option)) {
              return option;
            }

            const emoji = Iso3166Alpha2Code.toEmoji(option);
            const name = Iso3166Alpha2Code.toName(option);
            return `${emoji} ${name}`;
          }}
          renderInput={(params) => (
            <UI.TextField
              {...params}
              fullWidth
              label="Country"
              sx={{ marginBottom: 2 }}
            />
          )}
          onChange={(_event, value) => {
            if (value && Iso3166Alpha2Code.is(value)) {
              $send(['inputted-country', value]);
            }
          }}
        />

        <UI.TextField
          autoFocus
          sx={{ marginBottom: 2 }}
          type="tel"
          fullWidth
          inputMode="tel"
          label="Phone Number"
          value={model.phoneNumber}
          onChange={(event) => {
            $send(['inputted-phone-number', event.target.value]);
          }}
          error={
            model.validation === 'InvalidPhoneNumber' ||
            model.validation === 'EmptyPhoneNumber'
          }
          helperText={
            model.validation === 'InvalidPhoneNumber'
              ? `Invalid phone number for ${Iso3166Alpha2Code.toName(
                  model.country
                )}`
              : model.validation === 'EmptyPhoneNumber'
              ? 'Phone number is required'
              : undefined
          }
        />

        <UI.Button
          variant="contained"
          size="large"
          fullWidth
          loading={model.submission.type === 'Loading'}
          onClick={() => $send(['clicked-send-code'])}
        >
          Send Code
        </UI.Button>

        {model.submission.type === 'Problem' && (
          <UI.Alert severity="error" sx={{ marginTop: 2 }}>
            {model.submission.message}
          </UI.Alert>
        )}
      </UI.Box>
    </UI.FillBox>
  );
};

// 4802098698
