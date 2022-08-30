import * as Rx from "rxjs"
import { Cmd, exhaustive, Option, pipe, Result, Sub, Task } from "./Core"
import { UserId } from "./Data"
import * as Supabase from "./Supabase"

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
  | ["LoginResulted", Result.Result<{}, {}>]
  | ["LogoutResulted", Result.Result<{}, {}>]

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
          return [["LoggedIn", msg[1].value], Cmd.None]
      }

    case "LoginResulted":
      return [model, Cmd.None]

    case "LogoutResulted":
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
              Cmd.perform((result): Msg => ["LogoutResulted", result]),
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

export type LoginResult = Result.Result<Problem, {}>

export const loginWithEmailAndPassword =
  ({
    emailAddress,
    password,
  }: {
    emailAddress: string
    password: string
  }): Task.Task<LoginResult> =>
  async () => {
    const response = await Supabase.client.auth.signIn({
      email: emailAddress,
      password: password,
    })

    if (response.error) {
      return Result.Err({ message: response.error.message })
    }

    return Result.Ok({})
  }

export type Provider = "Google"

export const loginWithProvider =
  ({ provider }: { provider: Provider }): Task.Task<LoginResult> =>
  async () => {
    switch (provider) {
      case "Google": {
        const response = await Supabase.client.auth.signIn({
          provider: "google",
        })

        if (response.error) {
          return Result.Err({ message: response.error.message })
        }

        return Result.Ok({})
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
