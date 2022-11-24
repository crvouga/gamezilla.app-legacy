import { ListItemText } from "@mui/material"
import { matchSorter } from "match-sorter"
import { Browser, Cmd, p } from "../Core"
import { Iso3166Alpha2Code, PhoneNumber } from "../Data"
import { Alert, Box, Button, Divider, FillBox, IconButton, Icons, InputAdornment, InputBase, List, ListItemButton, ListItemIcon, TextField, ToggleButton, ToggleButtonGroup, Typography, useTheme } from "../UI"
import * as Auth from "./Auth"

//
//
//
// Model
//
//
//

export type Model = {
  method: "phone" | "email",
  drawer: "country" | "none",
  country_name: string,
  country: Iso3166Alpha2Code
  phone: string,
  email: string,
  code: string,
  send_code: SendCode
}

export const init: Model = {
  method: "phone",
  drawer: "none",
  country: "US",
  country_name: "",
  phone: "",
  email: "",
  code: "",
  send_code: { type: "not_asked" }
}


export type SendCode =
  | { type: "not_asked" }
  | { type: "err", err: string }
  | { type: "loading", phoneNumber: PhoneNumber }
  | {
    type: "ok",
    phoneNumber: PhoneNumber
    code: string,
    verify:
    | { type: "not_asked" }
    | { type: "loading", }
    | { type: "err", err: string }
    | { type: "ok", }
  }


//
//
//
// Update
//
//
//

export type Msg =
  | ["input_method", Model['method']]
  | ["input_drawer", Model['drawer']]
  | ["input_country_name", Model['country_name']]
  | ["clicked_country", Model['country']]
  | ["input_phone", Model['phone']]
  | ["input_email", Model['email']]
  | ['clicked_clear_search']
  | ['focused', Browser.FocusResult]
  | ['scrolled', Browser.FocusResult]
  | ['send_code']
  | ['send_code_done', Auth.AuthResult]
  | ['send_code_clear']
  | ['verify_code']
  | ['verify_code_done', Auth.AuthResult]
  | ['input_code', string]



export const update = (msg: Msg, model: Model): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case 'clicked_clear_search': {
      return [{ ...model, country_name: "" }, focus('country_name')]
    }

    case 'scrolled':
    case 'focused': {
      return [model, Cmd.None]
    }

    case 'input_method': {
      return [{ ...model, method: msg[1] }, Cmd.None]
    }

    case 'input_drawer': {
      return [{ ...model, drawer: msg[1] }, Cmd.None]
    }

    case 'input_country_name': {
      return [{ ...model, country_name: msg[1] }, Cmd.None]
    }

    case 'clicked_country': {
      return [{ ...model, drawer: "none", country: msg[1] }, Cmd.None]
    }

    case 'input_email': {
      return [{ ...model, email: msg[1] }, Cmd.None]
    }

    case 'input_phone': {
      return [{ ...model, phone: msg[1], send_code: { type: "not_asked" } }, Cmd.None]
    }

    case 'send_code': {
      const decoded = PhoneNumber.decode(model.country, model.phone)

      if (decoded.type === 'Err') {
        return [
          { ...model, send_code: { type: "err", err: "Invalid phone number" } },
          Cmd.None
        ]
      }

      return [
        { ...model, send_code: { type: "loading", phoneNumber: decoded.value } },
        p(Auth.sendCode({ phoneNumber: decoded.value }), Cmd.perform(result => ['send_code_done', result]))
      ]
    }

    case 'send_code_done': {
      if (model.send_code.type !== 'loading') {
        return [model, Cmd.None]
      }

      if (msg[1].type === 'Err') {
        return [{ ...model, send_code: { type: "err", err: msg[1].error.message } }, Cmd.None]
      }
      return [{ ...model, send_code: { type: "ok", phoneNumber: model.send_code.phoneNumber, code: "", verify: { type: "not_asked" } } },
      Cmd.batch([

        focus('code'),
        scrollIntoView('code')
      ])
      ]
    }


    case 'send_code_clear': {
      return [{ ...model, send_code: { type: "not_asked" } }, Cmd.None]
    }

    case 'input_code': {
      if (model.send_code.type !== 'ok') {
        return [model, Cmd.None]
      }

      return [{ ...model, send_code: { ...model.send_code, code: msg[1] } }, Cmd.None]
    }

    case 'verify_code': {
      if (model.send_code.type !== 'ok') {
        return [model, Cmd.None]
      }

      return [
        { ...model, send_code: { ...model.send_code, verify: { type: "loading" } } },
        p(Auth.verifyCode({ phoneNumber: model.send_code.phoneNumber, code: model.send_code.code }), Cmd.perform(result => ['verify_code_done', result]))
      ]
    }

    case 'verify_code_done': {
      if (model.send_code.type !== 'ok') {
        return [model, Cmd.None]
      }

      if (msg[1].type === 'Err') {
        return [
          { ...model, send_code: { ...model.send_code, verify: { type: "err", err: msg[1].error.message } } },
          Cmd.None
        ]
      }

      return [
        { ...model, send_code: { ...model.send_code, } },
        Cmd.None
      ]
    }

  }
}

const htmlIds = {
  country_name: "country_name",
  code: "code",
  root: 'root'
} as const

const focus = (id: keyof (typeof htmlIds)): Cmd<Msg> => {
  return p(
    Browser.focus(id),
    Cmd.perform(result => ['focused', result])
  )
}

const scrollIntoView = (id: keyof (typeof htmlIds)): Cmd<Msg> => {
  return p(
    Browser.scrollIntoView(id),
    Cmd.perform(result => ['scrolled', result])
  )
}


//
//
//
// View
//
//
//

export const View = ({
  model,
  $d,
}: {
  model: Model
  $d: (msg: Msg) => void
}) => {
  const theme = useTheme()

  if (model.drawer === 'country') {
    const matched = matchSorter(Iso3166Alpha2Code.all, model.country_name, { keys: [iso => Iso3166Alpha2Code.toName(iso)] })
    return (
      <FillBox id={htmlIds.root}>
        <Typography variant="h3" sx={{ px: 2, pt: 2 }}>
          Select country
        </Typography>

        <InputBase

          sx={{ p: 2 }}
          inputProps={{ id: htmlIds.country_name }}
          placeholder="Search country"
          value={model.country_name}
          onChange={e => $d(['input_country_name', e.target.value])}
          startAdornment={
            <InputAdornment position="start">
              <Icons.Search sx={{ color: 'text.secondary' }} />
            </InputAdornment>
          }
          endAdornment={
            <InputAdornment position="end">
              <IconButton edge="end" onClick={() => $d(['clicked_clear_search'])}>
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
          {matched.map(iso => (
            <ListItemButton key={iso} selected={iso === model.country} onClick={() => $d(['clicked_country', iso])}>
              <ListItemIcon sx={{ fontSize: "2rem" }}>
                {Iso3166Alpha2Code.toEmoji(iso)}
              </ListItemIcon>
              <ListItemText primary={Iso3166Alpha2Code.toName(iso)} />
            </ListItemButton>
          ))}
        </List>
        <Box sx={{ p: 2 }}>
          <Button fullWidth variant="outlined" onClick={() => $d(['input_drawer', 'none'])}>
            Close
          </Button>
        </Box>
      </FillBox>
    )
  }

  return (
    <FillBox sx={{ p: 2, gap: 2, paddingBottom: 6, }}>
      <Box>
        <Typography variant="h2">
          Sign Into
        </Typography>

        <Typography
          variant="h2"
          sx={{
            fontWeight: 800,
            mb: 1,
          }}
        >
          <Box component={"span"} sx={{
            background: `linear-gradient(${theme.palette.primary.light}, ${theme.palette.primary.dark})`,
            "backgroundClip": "text",
            "textFillColor": "transparent"
          }}>
            Gamezilla
          </Box>
        </Typography>
      </Box>
      <Box>
        <Typography sx={{ mb: 1 / 2 }} color="text.secondary">
          Choose Method
        </Typography>

        <ToggleButtonGroup fullWidth size="medium" value={model.method}>
          <ToggleButton value="phone" onClick={() => $d(['input_method', 'phone'])}>
            <Icons.Textsms sx={{ mr: 1 }} />
            Text
          </ToggleButton>
          <ToggleButton value="email" onClick={() => $d(['input_method', 'email'])}>
            <Icons.Email sx={{ mr: 1 }} />
            Email
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>


      <Divider orientation="vertical" sx={{ height: "2rem", marginX: "auto" }} />

      {model.method === 'phone' && (
        <>
          <TextField sx={{ width: '100%' }} fullWidth label="Enter Phone Number" placeholder="Phone number"
            type="tel"
            error={model.send_code.type === 'err'}
            helperText={model.send_code.type === 'err' ? 'Invalid phone number' : ''}
            value={model.phone}
            onChange={e => $d(['input_phone', e.target.value])}
            InputProps={{
              startAdornment:
                <InputAdornment position="start">
                  <IconButton
                    onClick={() => $d(['input_drawer', 'country'])}
                    edge="start"
                  >
                    {Iso3166Alpha2Code.toEmoji(model.country)}
                  </IconButton>
                </InputAdornment>

            }}
          />

          {model.send_code.type !== 'ok' ?
            <>
              <Button fullWidth variant="contained" size="large" startIcon={<Icons.SendToMobile />} onClick={() => $d(['send_code'])} loading={model.send_code.type === 'loading'}
                disabled={PhoneNumber.decode(model.country, model.phone).type === 'Err'}
              >
                Send Code
              </Button>
            </>
            : <>

              {/* <Divider orientation="vertical" sx={{ height: "2rem", marginX: "auto" }} /> */}
              <Alert severity="success" variant="filled" action={
                <IconButton color="inherit" size="small" onClick={() => $d(['send_code_clear'])}>
                  <Icons.Clear />
                </IconButton>
              }>
                <Typography
                  color="text.secondary"
                  variant="body2"
                >
                  The code was sent to{" "}
                  <Box
                    component="span"
                    sx={{ color: "text.primary" }}
                  >
                    {model.send_code.phoneNumber._validPhoneNumber}
                  </Box>
                </Typography>
              </Alert>
              <Divider orientation="vertical" sx={{ height: "2rem", marginX: "auto" }} />
              <TextField

                inputProps={{
                  id: htmlIds.code,
                  // why? https://stackoverflow.com/questions/54706919/material-ui-remove-the-yellow-background-on-textfield-autofill
                  style: { WebkitBoxShadow: `0 0 0 1000px ${theme.palette.background.default} inset` }
                }}
                sx={{ width: '100%' }}
                autoFocus
                fullWidth
                label="Enter Code"
                placeholder="Code"
                value={model.send_code.code}
                onChange={e => $d(['input_code', e.target.value])}
                type="tel"
              />
              <Button fullWidth variant="contained" size="large" startIcon={<Icons.VerifiedUser />} onClick={() => $d(['verify_code'])} loading={model.send_code.verify.type === 'loading'}
                disabled={model.send_code.code.length === 0}
              >
                Verify Code
              </Button>
              {model.send_code.verify.type === 'err' && (
                <Alert severity="error">
                  {model.send_code.verify.err}
                </Alert>
              )}
            </>
          }

        </>
      )}

      {model.method === 'email' && (
        <>
          <TextField type="email" sx={{ width: '100%' }} fullWidth label="Email" placeholder="Enter you email" />

          <Button fullWidth variant="contained" size="large" startIcon={<Icons.Send />}>
            Mail Link
          </Button>
        </>
      )}


    </FillBox>
  )
}


