import { either, option, task } from "fp-ts"
import { identity, pipe } from "fp-ts/lib/function"
import { Cmd } from "Core/Cmd"
import { perform } from "Core/Task"
import * as Rx from "rxjs"
import { cmd, sub } from "./Core"
import * as Supabase from "./Supabase"

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

export const init = (): [Model, Cmd<Msg>] => [
  { type: "Loading" },
  pipe(loadSession, perform(identity)),
]

//
//
//
// Update
//
//
//

export type Msg =
  | { type: "UserLoggedOut" }
  | { type: "UserLoggedIn"; session: Session }

export type GroupedMsg = Msg & { group: "Session" }

export const update = (msg: Msg): Model => {
  switch (msg.type) {
    case "UserLoggedIn":
      return { type: "LoggedIn", ...msg.session }

    case "UserLoggedOut":
      return { type: "LoggedOut" }
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
  (method: LoginMethod): task.Task<either.Either<{}, {}>> =>
  async () => {
    switch (method.type) {
      case "Google":
        const { error } = await Supabase.client.auth.signIn({
          provider: "google",
        })

        if (error) {
          return either.left({})
        }

        return either.right({})
    }
  }

export const logout: task.Task<either.Either<{}, {}>> = async () => {
  const { error } = await Supabase.client.auth.signOut()

  if (error) {
    return either.left({})
  }

  return either.right({})
}

export const loadSession: task.Task<Msg> = async () => {
  const session = Supabase.client.auth.session()

  const userId = session?.user?.id

  const defaultName =
    session?.user?.user_metadata?.name ??
    session?.user?.user_metadata?.full_name ??
    ""

  if (userId) {
    return { type: "UserLoggedIn", session: { defaultName, userId } }
  }

  return { type: "UserLoggedOut" }
}

export const load: task.Task<option.Option<Session>> = async () => {
  await new Promise((resolve) => setTimeout(resolve, 100))

  const session = Supabase.client.auth.session()

  const userId = session?.user?.id

  const defaultName =
    session?.user?.user_metadata?.name ??
    session?.user?.user_metadata?.full_name ??
    ""

  if (userId) {
    return option.some({ defaultName, userId })
  }

  return option.none
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

export const subscriptions: sub.Sub<Msg> = subject

export const fromSupabaseSession = (session: Supabase.Session | null): Msg => {
  const userId = session?.user?.id

  const defaultName =
    session?.user?.user_metadata?.name ??
    session?.user?.user_metadata?.full_name ??
    ""

  if (userId) {
    return { type: "UserLoggedIn", session: { userId, defaultName } }
  }

  return { type: "UserLoggedOut" }
}
