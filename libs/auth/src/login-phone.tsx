import { Browser, Cmd, exhaustive, p, t } from '@gamezilla/core';
import { Iso3166Alpha2Code, PhoneNumber, Route } from '@gamezilla/shared';
import {
  Alert,
  Box,
  Button,
  Divider,
  FillBox,
  Header,
  HeaderBackButton,
  IconButton,
  Icons,
  InputAdornment,
  InputBase,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  Typography,
} from '@gamezilla/shared/ui';
import { matchSorter } from 'match-sorter';
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
  countrySearchText: string;
  validation: 'NotChecked' | 'InvalidPhoneNumber' | 'EmptyPhoneNumber';
  submission:
    | { type: 'Idle' }
    | { type: 'Loading' }
    | { type: 'Problem'; message: string }
    | { type: 'Ok' };
};

const phoneNumberInputId = 'phoneNumberInputId';
const countrySelectInputId = 'countrySelectInputId';

export const init = ({
  country,
  phoneNumber,
  isSelectingCountry,
}: {
  country: Iso3166Alpha2Code;
  phoneNumber: string;
  isSelectingCountry: boolean;
}): { model: Model; cmd: Cmd<Msg> } => {
  return {
    model: {
      country,
      phoneNumber,
      countrySearchText: '',
      validation: 'NotChecked',
      submission: {
        type: 'Idle',
      },
    },
    cmd: p(
      Browser.focus(
        isSelectingCountry ? countrySelectInputId : phoneNumberInputId,
        100
      ),
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
  | ['clicked-send-code']
  | ['inputted-phone-number', string]
  | ['clicked-change-country']
  | ['inputted-country-search-text', string]
  | ['cleared-country-search-text']
  | ['closed-country-search']
  | ['send-code-done', PhoneNumber, Auth.AuthResult]
  | ['clicked-country-search-result', Iso3166Alpha2Code]
  | ['focus-done', Browser.FocusResult];

export const update = ({
  msg,
  model,
}: {
  msg: Msg;
  model: Model;
}): { model: Model; cmd?: Cmd<Msg> } => {
  switch (msg[0]) {
    case 'clicked-back': {
      return { model, cmd: Route.back };
    }

    case 'clicked-send-code': {
      if (model.phoneNumber.length === 0) {
        return { model: { ...model, validation: 'EmptyPhoneNumber' } };
      }

      const decoded = PhoneNumber.decode(model.country, model.phoneNumber);

      if (decoded.type === 'Err') {
        return { model: { ...model, validation: 'InvalidPhoneNumber' } };
      }

      const phoneNumber = decoded.value;

      return {
        model: { ...model, submission: { type: 'Loading' } },
        cmd: p(
          Auth.sendCode({ phoneNumber: phoneNumber }),
          Cmd.perform((result): Msg => ['send-code-done', phoneNumber, result])
        ),
      };
    }

    case 'inputted-phone-number': {
      return {
        model: { ...model, phoneNumber: msg[1], validation: 'NotChecked' },
      };
    }

    case 'clicked-country-search-result': {
      return {
        model: { ...model, country: msg[1], validation: 'NotChecked' },
        cmd: Route.push(['login-phone', { isSelectingCountry: false }]),
      };
    }

    case 'send-code-done': {
      const phoneNumber = msg[1];
      const result = msg[2];

      if (result.type === 'Err') {
        return {
          model: {
            ...model,
            submission: { type: 'Problem', message: result.error.message },
          },
        };
      }

      return {
        model: { ...model, submission: { type: 'Ok' } },
        cmd: Route.push(['login-phone-verify', { phoneNumber: phoneNumber }]),
      };
    }

    case 'clicked-change-country': {
      return {
        model,
        cmd: Route.push(['login-phone', { isSelectingCountry: true }]),
      };
    }

    case 'closed-country-search': {
      return {
        model,
        cmd: Route.push(['login-phone', { isSelectingCountry: false }]),
      };
    }

    case 'inputted-country-search-text': {
      return {
        model: { ...model, countrySearchText: msg[1] },
      };
    }
    case 'cleared-country-search-text': {
      return {
        model: { ...model, countrySearchText: '' },
      };
    }

    case 'focus-done': {
      return { model };
    }

    default: {
      return exhaustive(msg[0]);
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
  isSelectingCountry,
}: {
  isSelectingCountry: boolean;
  model: Model;
  $send: (msg: Msg) => void;
}) => {
  if (isSelectingCountry) {
    return (
      <CountrySelectScreen
        inputId={countrySelectInputId}
        searchText={model.countrySearchText}
        onChange={(text) => $send(['inputted-country-search-text', text])}
        onClear={() => $send(['cleared-country-search-text'])}
        selected={model.country}
        onSelect={(country) =>
          $send(['clicked-country-search-result', country])
        }
        onClose={() => $send(['closed-country-search'])}
      />
    );
  }

  return (
    <FillBox>
      <Header
        left={<HeaderBackButton onClick={() => $send(['clicked-back'])} />}
        title="Login With Phone"
      />
      <Box
        sx={{
          padding: 2,
        }}
      >
        <Typography color="text.secondary">Country</Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 2,
          }}
        >
          <Box sx={{ fontSize: '2rem', marginRight: 1 }}>
            {Iso3166Alpha2Code.toEmoji(model.country)}
          </Box>
          <Typography sx={{ flex: 1 }} color="text.secondary">
            {Iso3166Alpha2Code.toName(model.country)}
          </Typography>

          <Button onClick={() => $send(['clicked-change-country'])}>
            Change
          </Button>
        </Box>

        <TextField
          id={phoneNumberInputId}
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

        <Button
          variant="contained"
          size="large"
          fullWidth
          loading={model.submission.type === 'Loading'}
          onClick={() => $send(['clicked-send-code'])}
        >
          Send Code
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

export const CountrySelectScreen = ({
  searchText,
  inputId,
  onChange,
  onClear,
  selected,
  onSelect,
  onClose,
}: {
  searchText: string;
  inputId: string;
  onChange: (s: string) => void;
  onClear: () => void;
  selected: Iso3166Alpha2Code;
  onSelect: (country: Iso3166Alpha2Code) => void;
  onClose: () => void;
}) => {
  const matched = matchSorter(Iso3166Alpha2Code.all, searchText, {
    keys: [(iso) => Iso3166Alpha2Code.toName(iso)],
  });
  return (
    <FillBox>
      <Typography variant="h3" sx={{ px: 2, pt: 2 }}>
        Select country
      </Typography>

      <InputBase
        sx={{ p: 2 }}
        id={inputId}
        placeholder="Search country"
        value={searchText}
        onChange={(e) => onChange(e.target.value)}
        startAdornment={
          <InputAdornment position="start">
            <Icons.Search sx={{ color: 'text.secondary' }} />
          </InputAdornment>
        }
        endAdornment={
          <InputAdornment position="end">
            <IconButton edge="end" onClick={onClear}>
              <Icons.Clear />
            </IconButton>
          </InputAdornment>
        }
      />

      <Divider />

      {matched.length === 0 && (
        <Typography color="text.secondary" sx={{ p: 2 }}>
          No countries match
        </Typography>
      )}

      <List disablePadding sx={{ overflowY: 'scroll', flex: 1 }}>
        {matched.map((iso) => (
          <ListItemButton
            key={iso}
            selected={iso === selected}
            onClick={() => onSelect(iso)}
          >
            <ListItemIcon sx={{ fontSize: '2rem' }}>
              {Iso3166Alpha2Code.toEmoji(iso)}
            </ListItemIcon>
            <ListItemText primary={Iso3166Alpha2Code.toName(iso)} />
          </ListItemButton>
        ))}
      </List>
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={onClose}
          startIcon={<Icons.Close />}
        >
          Close
        </Button>
      </Box>
    </FillBox>
  );
};
