import * as Rx from "rxjs"
import { Cmd, exhaustive, Option, pipe, Result, Sub, Task, Unit } from "./Core"
import { PhoneNumber, UserId } from "./Data"
import * as Supabase from "./Supabase"
import * as Wire from "./Wire"

//
//
//
// Model
//
//
//

export type Session = { defaultName: string; userId: UserId.UserId }

export type Model = ["Loading"] | ["LoggedOut"] | ["LoggedIn", Session]

export const init = (): [Model, Cmd.Cmd<Msg>] => {
  return [
    ["Loading"],
    pipe(
      getSession,
      Cmd.perform((msg) => msg),
    ),
  ]
}

//
//
//
// Msg
//
//
//

export type Msg =
  | ["GotSession", Option.Option<Session>]
  | ["Login_Done", Result.Result<{}, {}>]
  | ["Logout_Done", Result.Result<{}, {}>]

export type Action = ["Auth", ["Logout"]]

//
//
//
// Update
//
//
//

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "GotSession":
      switch (msg[1].type) {
        case "None":
          return [["LoggedOut"], Cmd.None]

        case "Some":
          return [
            ["LoggedIn", msg[1].value],
            Wire.sendToBackend(["UserLoggedIn", msg[1].value.userId]),
          ]
      }

    case "Login_Done":
      return [model, Cmd.None]

    case "Logout_Done":
      switch (msg[1].type) {
        case "Err":
          return [model, Cmd.None]

        case "Ok":
          return [["LoggedOut"], Cmd.None]

        default:
          return exhaustive(msg[1])
      }

    default:
      return exhaustive(msg[0])
  }
}

export const runAction = (
  action: Action,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (action[0]) {
    case "Auth": {
      switch (action[1][0]) {
        case "Logout":
          return [
            model,
            pipe(
              logout,
              Cmd.perform((result): Msg => ["Logout_Done", result]),
            ),
          ]
      }
    }
  }
}

//
//
//
// Auth
//
//
//

type Problem = { message: string }

export type AuthResult = Result.Result<Problem, Unit>

export const loginWithEmailAndPassword =
  ({
    emailAddress,
    password,
  }: {
    emailAddress: string
    password: string
  }): Task.Task<AuthResult> =>
    async () => {
      const response = await Supabase.client.auth.signIn({
        email: emailAddress,
        password: password,
      })

      if (response.error) {
        return Result.Err({ message: response.error.message })
      }

      return Result.Ok(Unit)
    }

export const sendCode =
  ({ phoneNumber }: { phoneNumber: PhoneNumber.PhoneNumber }): Task.Task<AuthResult> =>
    async () => {
      const response = await Supabase.client.auth.signIn({
        phone: PhoneNumber.toString(phoneNumber),
      })

      if (response.error) {
        return Result.Err({ message: response.error.message })
      }

      return Result.Ok(Unit)
    }

export const verifyCode =
  ({ code, phoneNumber }: { code: string, phoneNumber: PhoneNumber.PhoneNumber }): Task.Task<AuthResult> =>
    async () => {
      const response = await Supabase.client.auth.verifyOTP({
        phone: PhoneNumber.toString(phoneNumber),
        token: code
      })

      if (response.error) {
        return Result.Err({ message: response.error.message })
      }

      return Result.Ok(Unit)
    }


export const loginWithEmailLink =
  ({ emailAddress }: { emailAddress: string }): Task.Task<AuthResult> =>
    async () => {
      const response = await Supabase.client.auth.signIn({
        email: emailAddress,
      })

      if (response.error) {
        return Result.Err({ message: response.error.message })
      }

      return Result.Ok(Unit)
    }

export type Provider = "Google"

export const loginWithProvider =
  ({ provider }: { provider: Provider }): Task.Task<AuthResult> =>
    async () => {
      switch (provider) {
        case "Google": {
          const response = await Supabase.client.auth.signIn({
            provider: "google",
          })

          if (response.error) {
            return Result.Err({ message: response.error.message })
          }

          return Result.Ok(Unit)
        }
      }
    }

const logout: Task.Task<Result.Result<{}, {}>> = async () => {
  const { error } = await Supabase.client.auth.signOut()

  if (error) {
    return Result.Err({})
  }

  return Result.Ok({})
}

const getSession: Task.Task<Msg> = async () => {
  const session = Supabase.client.auth.session()

  return fromSupabaseSession(session)
}

//
//
//
// Subscriptions
//
//
//

const subject = new Rx.Subject<Msg>()

Supabase.client.auth.onAuthStateChange((event, supabaseSession) => {
  switch (event) {
    case "PASSWORD_RECOVERY":
    case "SIGNED_IN":
    case "SIGNED_OUT":
    case "TOKEN_REFRESHED":
    case "USER_DELETED":
    case "USER_UPDATED": {
      const msg = fromSupabaseSession(supabaseSession)
      subject.next(msg)
    }
  }
})

export const subscriptions: Sub.Sub<Msg> = subject

//
//
//
// Helper
//
//
//

export const fromSupabaseSession = (auth: Supabase.Session | null): Msg => {
  const userId = UserId.decode(auth?.user?.id)

  const defaultName =
    auth?.user?.user_metadata?.name ??
    auth?.user?.user_metadata?.full_name ??
    ""

  if (userId.type === "Ok") {
    return ["GotSession", Option.Some({ userId: userId.value, defaultName })]
  }

  return ["GotSession", Option.None]
}
