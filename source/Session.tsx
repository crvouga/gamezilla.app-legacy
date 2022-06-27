import * as Rx from "rxjs"
import * as Supabase from "./Supabase"
import { Cmd, Option, Result, Sub, Task, pipe } from "./Core"

//
//
//
// Model
//
//
//

export type Session = { defaultName: string; userId: string }

export type Model = Loading | LoggedOut | LoggedIn

export type Loading = { type: "Loading" }

export type LoggedOut = { type: "LoggedOut" }

export type LoggedIn = {
  type: "LoggedIn"
  defaultName: string
  userId: string
}

export const init = (): [Model, Cmd.Cmd<Msg>] => [
  { type: "Loading" },
  pipe(
    loadSession,
    Cmd.fromTask((msg) => msg),
  ),
]

//
//
//
// Msg
//
//
//

export type Msg = GotSession

const GotSession = (session: Option.Option<Session>) => {
  return {
    group: "Session",
    type: "GotSession",
    session,
  } as const
}
type GotSession = ReturnType<typeof GotSession>

//
//
//
// Update
//
//
//

export const update = (msg: Msg): Model => {
  switch (msg.type) {
    case "GotSession":
      switch (msg.session.type) {
        case "None":
          return { type: "LoggedOut" }

        case "Some":
          return { type: "LoggedIn", ...msg.session.value }
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

export type LoginMethod = { type: "Google" }

export const login =
  (method: LoginMethod): Task.Task<Result.Result<{}, {}>> =>
  async () => {
    switch (method.type) {
      case "Google":
        const { error } = await Supabase.client.auth.signIn({
          provider: "google",
        })

        if (error) {
          return Result.Err({})
        }

        return Result.Ok({})
    }
  }

export const logout: Task.Task<Result.Result<{}, {}>> = async () => {
  const { error } = await Supabase.client.auth.signOut()

  if (error) {
    return Result.Err({})
  }

  return Result.Ok({})
}

export const loadSession: Task.Task<Msg> = async () => {
  const session = Supabase.client.auth.session()

  const userId = session?.user?.id

  const defaultName =
    session?.user?.user_metadata?.name ??
    session?.user?.user_metadata?.full_name ??
    ""

  if (userId) {
    return GotSession(Option.Some({ userId, defaultName }))
  }

  return GotSession(Option.None)
}

//
//
//
// Supscriptions
//
//
//

const subject = new Rx.Subject<Msg>()

Supabase.client.auth.onAuthStateChange((_, supabaseSession) => {
  subject.next(fromSupabaseSession(supabaseSession))
})

export const subscriptions: Sub.Sub<Msg> = subject

export const fromSupabaseSession = (session: Supabase.Session | null): Msg => {
  const userId = session?.user?.id

  const defaultName =
    session?.user?.user_metadata?.name ??
    session?.user?.user_metadata?.full_name ??
    ""

  if (userId) {
    return GotSession(Option.Some({ userId, defaultName }))
  }

  return GotSession(Option.None)
}
