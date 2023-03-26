import { Cmd, p, t } from '@gamezilla/core';
import { Route } from '@gamezilla/temp-shared';
import {
  Box,
  Button,
  Icons,
  Typography,
  useTheme,
} from '@gamezilla/temp-shared/ui';
import { AuthResult, loginWithProvider } from '../auth';

//
//
//
// Model
//
//
//

export type Model = 'idle' | 'signing-in-with-google';

export const init: Model = 'idle';

//
//
//
// Update
//
//
//

export type Msg =
  | ['clicked-email']
  | ['clicked-text']
  | ['clicked-google']
  | ['login-done', AuthResult];

export const update = ({
  msg,
  model,
}: {
  msg: Msg;
  model: Model;
}): { model: Model; cmd: Cmd<Msg> } => {
  switch (msg[0]) {
    case 'clicked-text': {
      return {
        model,
        cmd: Route.push(['login-phone', { isSelectingCountry: false }]),
      };
    }

    case 'clicked-email': {
      return { model, cmd: Route.push(['login-email-link']) };
    }

    case 'clicked-google': {
      return {
        model: 'signing-in-with-google',
        cmd: p(
          loginWithProvider({ provider: 'Google' }),
          Cmd.perform(t('login-done'))
        ),
      };
    }

    case 'login-done': {
      return { model, cmd: Cmd.None };
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
  const theme = useTheme();
  return (
    <Box
      sx={{
        p: 2,
        width: '100%',
        height: '100%',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <Box sx={{ width: '100%' }}>
        <Typography variant="h2">Sign Into</Typography>

        <Typography
          variant="h2"
          sx={{
            fontWeight: 800,
            mb: 3,
          }}
        >
          <Box
            component={'span'}
            sx={{
              background: `linear-gradient(${theme.palette.primary.light}, ${theme.palette.primary.dark})`,
              backgroundClip: 'text',
              textFillColor: 'transparent',
            }}
          >
            Gamezilla
          </Box>
        </Typography>

        <Button
          onClick={() => $send(['clicked-google'])}
          startIcon={<Icons.Google />}
          fullWidth
          variant="contained"
          size="large"
          loading={model === 'signing-in-with-google'}
          sx={{ mb: 3 }}
        >
          Continue With Google
        </Button>

        <Button
          onClick={() => $send(['clicked-text'])}
          startIcon={<Icons.Textsms />}
          fullWidth
          variant="contained"
          size="large"
          sx={{ mb: 3 }}
        >
          Continue With Text
        </Button>

        <Button
          onClick={() => $send(['clicked-email'])}
          startIcon={<Icons.Email />}
          fullWidth
          variant="contained"
          size="large"
        >
          Continue With Email
        </Button>
      </Box>
    </Box>
  );
};
