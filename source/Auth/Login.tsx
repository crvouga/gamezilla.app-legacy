import { ListItemText } from "@mui/material"
import { matchSorter } from "match-sorter"
import { Browser, Cmd, p } from "../Core"
import { EmailAddress, Iso3166Alpha2Code, PhoneNumber } from "../Data"
import * as Route from "../Route"
import {
  Alert,
  AlertTitle,
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
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
} from "../UI"
import * as Auth from "./Auth"

//
//
//
// Model
//
//
//

export type Model = {
  method: "phone" | "email"
  drawer: "country" | "none"
  country_name: string
  country: Iso3166Alpha2Code
  phone: string
  email: string
  code: string
  send_code: SendCode
  send_link: SendLink
}

export type SendLink =
  | { tag: "not_asked" }
  | { tag: "loading"; email: string }
  | { tag: "err"; err: string }
  | { tag: "ok"; email: string }

export type SendCode =
  | { tag: "not_asked" }
  | { tag: "err"; err: string }
  | { tag: "loading"; phoneNumber: PhoneNumber }
  | {
      tag: "ok"
      phoneNumber: PhoneNumber
      code: string
      verify:
        | { tag: "not_asked" }
        | { tag: "loading" }
        | { tag: "err"; err: string }
        | { tag: "ok" }
    }

export const init: Model = {
  method: "phone",
  drawer: "none",
  country: "US",
  country_name: "",
  phone: "",
  email: "",
  code: "",
  send_code: { tag: "not_asked" },
  send_link: { tag: "not_asked" },
}

//
//
//
// Update
//
//
//

export type Msg =
  | ["input_method", Model["method"]]
  | ["input_drawer", Model["drawer"]]
  | ["input_country_name", Model["country_name"]]
  | ["clicked_country", Model["country"]]
  | ["input_phone", Model["phone"]]
  | ["input_email", Model["email"]]
  | ["send_link"]
  | ["send_link_done", Auth.AuthResult]
  | ["clicked_clear_search"]
  | ["focused", Browser.FocusResult]
  | ["scrolled", Browser.FocusResult]
  | ["send_code"]
  | ["send_code_done", Auth.AuthResult]
  | ["send_code_clear"]
  | ["verify_code"]
  | ["verify_code_done", Auth.AuthResult]
  | ["input_code", string]
  | ["clicked_phone_clear"]

export const update = (msg: Msg, model: Model): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case "clicked_clear_search": {
      return [{ ...model, country_name: "" }, focus("country_name")]
    }

    case "scrolled":
    case "focused": {
      return [model, Cmd.None]
    }

    case "input_method": {
      return [{ ...model, method: msg[1] }, Cmd.None]
    }

    case "input_drawer": {
      return [model, Route.push(["Login", { drawer: msg[1] }])]
    }

    case "input_country_name": {
      return [{ ...model, country_name: msg[1] }, Cmd.None]
    }

    case "clicked_country": {
      return [
        { ...model, country: msg[1] },
        Cmd.batch([Route.push(["Login", { drawer: "none" }]), focus("phone")]),
      ]
    }

    case "input_email": {
      return [{ ...model, email: msg[1] }, Cmd.None]
    }

    case "input_phone": {
      return [
        { ...model, phone: msg[1], send_code: { tag: "not_asked" } },
        Cmd.None,
      ]
    }

    case "clicked_phone_clear": {
      return [
        { ...model, phone: "", send_code: { tag: "not_asked" } },
        focus("phone"),
      ]
    }

    case "send_code": {
      const decoded = PhoneNumber.decode(model.country, model.phone)

      if (decoded.type === "Err") {
        return [
          { ...model, send_code: { tag: "err", err: "Invalid phone number" } },
          Cmd.None,
        ]
      }

      return [
        { ...model, send_code: { tag: "loading", phoneNumber: decoded.value } },
        p(
          Auth.sendCode({ phoneNumber: decoded.value }),
          Cmd.perform((result) => ["send_code_done", result]),
        ),
      ]
    }

    case "send_code_done": {
      if (model.send_code.tag !== "loading") {
        return [model, Cmd.None]
      }

      if (msg[1].type === "Err") {
        return [
          { ...model, send_code: { tag: "err", err: msg[1].error.message } },
          Cmd.None,
        ]
      }
      return [
        {
          ...model,
          send_code: {
            tag: "ok",
            phoneNumber: model.send_code.phoneNumber,
            code: "",
            verify: { tag: "not_asked" },
          },
        },
        Cmd.batch([focus("code"), scrollIntoView("code")]),
      ]
    }

    case "send_code_clear": {
      return [{ ...model, send_code: { tag: "not_asked" } }, focus("phone")]
    }

    case "input_code": {
      if (model.send_code.tag !== "ok") {
        return [model, Cmd.None]
      }

      return [
        { ...model, send_code: { ...model.send_code, code: msg[1] } },
        Cmd.None,
      ]
    }

    case "verify_code": {
      if (model.send_code.tag !== "ok") {
        return [model, Cmd.None]
      }

      return [
        {
          ...model,
          send_code: { ...model.send_code, verify: { tag: "loading" } },
        },
        p(
          Auth.verifyCode({
            phoneNumber: model.send_code.phoneNumber,
            code: model.send_code.code,
          }),
          Cmd.perform((result) => ["verify_code_done", result]),
        ),
      ]
    }

    case "verify_code_done": {
      if (model.send_code.tag !== "ok") {
        return [model, Cmd.None]
      }

      if (msg[1].type === "Err") {
        return [
          {
            ...model,
            send_code: {
              ...model.send_code,
              verify: { tag: "err", err: msg[1].error.message },
            },
          },
          Cmd.None,
        ]
      }

      return [{ ...model, send_code: { ...model.send_code } }, Cmd.None]
    }

    case "send_link": {
      return [
        { ...model, send_link: { tag: "loading", email: model.email } },
        p(
          Auth.loginWithEmailLink({ emailAddress: model.email }),
          Cmd.perform((result) => ["send_link_done", result]),
        ),
      ]
    }

    case "send_link_done": {
      if (model.send_link.tag !== "loading") {
        return [model, Cmd.None]
      }

      if (msg[1].type === "Err") {
        return [
          { ...model, send_link: { tag: "err", err: msg[1].error.message } },
          Cmd.None,
        ]
      }

      return [
        { ...model, send_link: { tag: "ok", email: model.send_link.email } },
        Cmd.None,
      ]
    }
  }
}

const htmlIds = {
  country_name: "country_name",
  code: "code",
  root: "root",
  phone: "phone",
} as const

const focus = (id: keyof typeof htmlIds): Cmd<Msg> => {
  return p(
    Browser.focus(id),
    Cmd.perform((result) => ["focused", result]),
  )
}

const scrollIntoView = (id: keyof typeof htmlIds): Cmd<Msg> => {
  return p(
    Browser.scrollIntoView(id),
    Cmd.perform((result) => ["scrolled", result]),
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
  drawer,
  model,
  $d,
}: {
  drawer: "country" | "none"
  model: Model
  $d: (msg: Msg) => void
}) => {
  const theme = useTheme()

  if (drawer === "country") {
    return (
      <CountrySelectScreen
        inputId={htmlIds.country_name}
        onChange={(s) => $d(["input_country_name", s])}
        onClear={() => $d(["clicked_clear_search"])}
        onClose={() => $d(["input_drawer", "none"])}
        onSelect={(country) => $d(["clicked_country", country])}
        searchText={model.country_name}
        selected={model.country}
      />
    )
  }

  return (
    <FillBox
      id={htmlIds.root}
      sx={{ p: 2, gap: 2, paddingBottom: 8 }}
    >
      <Box>
        <Typography variant="h2">Sign Into</Typography>

        <Typography
          variant="h2"
          sx={{
            fontWeight: 800,
            mb: 1,
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
      </Box>
      <Box>
        <Typography
          sx={{ mb: 1 / 2 }}
          color="text.secondary"
        >
          Choose Method
        </Typography>

        <ToggleButtonGroup
          fullWidth
          size="medium"
          value={model.method}
        >
          <ToggleButton
            value="phone"
            onClick={() => $d(["input_method", "phone"])}
          >
            <Icons.Textsms sx={{ mr: 1 }} />
            Text
          </ToggleButton>
          <ToggleButton
            value="email"
            onClick={() => $d(["input_method", "email"])}
          >
            <Icons.Email sx={{ mr: 1 }} />
            Email
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Divider
        orientation="vertical"
        sx={{ height: "3rem", marginX: "auto" }}
      />

      {model.method === "phone" && (
        <>
          <TextField
            fullWidth
            label="Enter Phone Number"
            placeholder="Phone number"
            type="tel"
            id={htmlIds.phone}
            error={model.send_code.tag === "err"}
            helperText={
              model.send_code.tag === "err" ? "Invalid phone number" : ""
            }
            value={model.phone}
            onChange={(e) => $d(["input_phone", e.target.value])}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconButton
                    onClick={() => $d(["input_drawer", "country"])}
                    edge="start"
                  >
                    {Iso3166Alpha2Code.toEmoji(model.country)}
                  </IconButton>
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => $d(["clicked_phone_clear"])}
                    edge="end"
                  >
                    <Icons.Clear />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {model.send_code.tag !== "ok" ? (
            <>
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<Icons.SendToMobile />}
                onClick={() => $d(["send_code"])}
                loading={model.send_code.tag === "loading"}
                disabled={
                  PhoneNumber.decode(model.country, model.phone).type === "Err"
                }
              >
                Send Code
              </Button>
            </>
          ) : (
            <>
              {/* <Divider orientation="vertical" sx={{ height: "2rem", marginX: "auto" }} /> */}
              <Alert
                severity="success"
                action={
                  <IconButton
                    color="inherit"
                    size="small"
                    onClick={() => $d(["send_code_clear"])}
                  >
                    <Icons.Clear />
                  </IconButton>
                }
              >
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
              <Divider
                orientation="vertical"
                sx={{ height: "3rem", marginX: "auto" }}
              />
              <TextField
                inputProps={{
                  id: htmlIds.code,
                  // why? https://stackoverflow.com/questions/54706919/material-ui-remove-the-yellow-background-on-textfield-autofill
                  style: {
                    WebkitBoxShadow: `0 0 0 1000px ${theme.palette.background.default} inset`,
                  },
                }}
                sx={{ width: "100%" }}
                autoFocus
                fullWidth
                label="Enter Code"
                placeholder="Code"
                value={model.send_code.code}
                onChange={(e) => $d(["input_code", e.target.value])}
                type="tel"
              />
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<Icons.VerifiedUser />}
                onClick={() => $d(["verify_code"])}
                loading={model.send_code.verify.tag === "loading"}
                disabled={model.send_code.code.length === 0}
              >
                Verify Code
              </Button>
              {model.send_code.verify.tag === "err" && (
                <Alert severity="error">{model.send_code.verify.err}</Alert>
              )}
            </>
          )}
        </>
      )}

      {model.method === "email" && (
        <>
          <TextField
            type="email"
            sx={{ width: "100%" }}
            fullWidth
            label="Enter Email"
            placeholder="Email"
            value={model.email}
            onChange={(e) => $d(["input_email", e.target.value])}
          />

          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={<Icons.Send />}
            onClick={() => $d(["send_link"])}
            loading={model.send_link.tag === "loading"}
            disabled={EmailAddress.decode(model.email).type === "Err"}
          >
            Mail Link
          </Button>

          {model.send_link.tag === "err" && (
            <Alert severity="error">{model.send_link.err}</Alert>
          )}

          {model.send_link.tag === "ok" && (
            <Alert severity="success">
              <AlertTitle>Check your email</AlertTitle>
              <Typography
                color="text.secondary"
                variant="body2"
              >
                An email was sent to{" "}
                <Box
                  component="span"
                  sx={{ color: "text.primary" }}
                >
                  {model.send_link.email}
                </Box>
                . It has a link that will sign you in.
              </Typography>
            </Alert>
          )}
        </>
      )}
    </FillBox>
  )
}

const CountrySelectScreen = ({
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
      <Typography
        variant="h3"
        sx={{ px: 2, pt: 2 }}
      >
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
            <IconButton
              edge="end"
              onClick={onClear}
            >
              <Icons.Clear />
            </IconButton>
          </InputAdornment>
        }
      />

      <Divider />

      {matched.length === 0 && (
        <Typography
          color="text.secondary"
          sx={{ p: 2 }}
        >
          No countries match
        </Typography>
      )}

      <List
        disablePadding
        sx={{ overflowY: "scroll", flex: 1 }}
      >
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
