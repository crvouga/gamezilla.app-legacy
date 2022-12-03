import { ListItemText } from "@mui/material"
import { matchSorter } from "match-sorter"
import { Cmd } from "../Core"
import { Iso3166Alpha2Code } from "../Data"
import * as Route from "../Route"
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
  ListItemIcon, Typography,
  useTheme
} from "../UI"

//
//
//
// Model
//
//
//

export type Model = {}

export const init: Model = {}

//
//
//
// Update
//
//
//

export type Msg =
  | ["clicked_email"]
  | ["clicked_text"]

export const update = (msg: Msg, model: Model): [Model, Cmd<Msg>] => {
  switch (msg[0]) {

    case 'clicked_text': {
      return [model, Route.push(['LoginPhone'])]
    }

    case 'clicked_email': {
      return [model, Route.push(['LoginEmailLink'])]
    }


  }
}

//
//
//
// View
//
//
//

export const View = ({
  $d,
}: {
  model: Model
  $d: (msg: Msg) => void
}) => {
  const theme = useTheme()

  return (
    <Box sx={{ p: 2, width: '100%', height: "100%", display: "grid", placeItems: "center" }}>

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
            component={"span"}
            sx={{
              background: `linear-gradient(${theme.palette.primary.light}, ${theme.palette.primary.dark})`,
              backgroundClip: "text",
              textFillColor: "transparent",
            }}
          >
            Gamezilla
          </Box>
        </Typography>



        <Button onClick={() => $d(['clicked_text'])} startIcon={<Icons.Textsms />} fullWidth variant="contained" size="large" sx={{ mb: 3 }}>
          Continue With Text
        </Button>

        <Button onClick={() => $d(['clicked_email'])} startIcon={<Icons.Email />} fullWidth variant="contained" size="large">
          Continue With Email
        </Button>
      </Box>
    </Box>
  )
}

export const CountrySelectScreen = ({
  searchText,
  inputId,
  onChange,
  onClear,
  selected,
  onSelect,
  onClose,
}: {
  searchText: string
  inputId: string
  onChange: (s: string) => void
  onClear: () => void
  selected: Iso3166Alpha2Code
  onSelect: (country: Iso3166Alpha2Code) => void
  onClose: () => void
}) => {
  const matched = matchSorter(Iso3166Alpha2Code.all, searchText, {
    keys: [(iso) => Iso3166Alpha2Code.toName(iso)],
  })
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
            <Icons.Search sx={{ color: "text.secondary" }} />
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

      <List disablePadding sx={{ overflowY: "scroll", flex: 1 }}>
        {matched.map((iso) => (
          <ListItemButton
            key={iso}
            selected={iso === selected}
            onClick={() => onSelect(iso)}
          >
            <ListItemIcon sx={{ fontSize: "2rem" }}>
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
  )
}
