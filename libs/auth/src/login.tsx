import { Cmd } from '@gamezilla/core';
import { Route } from '@gamezilla/shared';
import { Box, Button, Icons, Typography, useTheme } from '@gamezilla/shared/ui';

//
//
//
// Model
//
//
//

export type Model = null;

export const init: Model = null;

//
//
//
// Update
//
//
//

export type Msg = ['clicked-email'] | ['clicked-text'];

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
      <Box sx={{ pb: 8 }}>
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
