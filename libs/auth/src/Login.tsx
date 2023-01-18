import { Cmd } from '@gamezilla/core';
import { Iso3166Alpha2Code } from '@gamezilla/shared';
import { Route } from '@gamezilla/shared';
import {
  Box,
  Button,
  Divider,
  FillBox,
  IconButton,
  Icons,
  InputAdornment,
  InputBase,
  List,
  ListItemButton,
  ListItemIcon,
  Typography,
  useTheme,
} from '@gamezilla/ui';
import { ListItemText } from '@mui/material';
import { matchSorter } from 'match-sorter';

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

export type Msg = ['clicked_email'] | ['clicked_text'];

export const update = (msg: Msg, model: Model): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case 'clicked_text': {
      return [model, Route.push(['LoginPhone'])];
    }

    case 'clicked_email': {
      return [model, Route.push(['LoginEmailLink'])];
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
          onClick={() => $send(['clicked_text'])}
          startIcon={<Icons.Textsms />}
          fullWidth
          variant="contained"
          size="large"
          sx={{ mb: 3 }}
        >
          Continue With Text
        </Button>

        <Button
          onClick={() => $send(['clicked_email'])}
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
