import * as Rx from "rxjs";
import * as Supabase from "./Supabase";
import { Cmd, Option, Result, Sub, Task, pipe } from "./Core";

//
//
//
// Model
//
//
//

export type Session = { defaultName: string; userId: string };

export type Model = Loading | LoggedOut | LoggedIn;

export type Loading = { type: "Loading" };

export type LoggedOut = { type: "LoggedOut" };

export type LoggedIn = {
  type: "LoggedIn";
  defaultName: string;
  userId: string;
};

export const init = (): [Model, Cmd.Cmd<Msg>] => [
  { type: "Loading" },
  pipe(
    getSession,
    Cmd.fromTask((msg) => msg),
  ),
];

//
//
//
// Msg
//
//
//

export type Msg = GotSession | LoginResulted | LogoutResulted;

export type Action = Logout | Login;

const GotSession = (session: Option.Option<Session>) => {
  return {
    group: "Session",
    type: "GotSession",
    session,
  } as const;
};
type GotSession = ReturnType<typeof GotSession>;

const LoginResulted = (result: Result.Result<{}, {}>) => {
  return {
    group: "Session",
    type: "LoginResulted",
    result,
  } as const;
};
type LoginResulted = ReturnType<typeof LoginResulted>;

const LogoutResulted = (result: Result.Result<{}, {}>) => {
  return {
    group: "Session",
    type: "LogoutResulted",
    result,
  } as const;
};
type LogoutResulted = ReturnType<typeof LogoutResulted>;

export const Logout = () => {
  return {
    group: "Session",
    type: "Logout",
  } as const;
};
export type Logout = ReturnType<typeof Logout>;

export const Login = (method: LoginMethod) => {
  return {
    group: "Session",
    type: "Login",
    method,
  } as const;
};
export type Login = ReturnType<typeof Login>;

//
//
//
// Update
//
//
//

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "GotSession":
      switch (msg.session.type) {
        case "None":
          return [{ type: "LoggedOut" }, Cmd.None];

        case "Some":
          return [{ type: "LoggedIn", ...msg.session.value }, Cmd.None];
      }

    case "LoginResulted":
      return [model, Cmd.None];

    case "LogoutResulted":
      switch (msg.result.type) {
        case "Err":
          return [model, Cmd.None];

        case "Ok":
          return [{ type: "LoggedOut" }, Cmd.None];
      }
  }
};

export const runAction = (
  action: Action,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (action.type) {
    case "Login":
      return [model, pipe(login(action.method), Cmd.fromTask(LoginResulted))];

    case "Logout":
      return [model, pipe(logout, Cmd.fromTask(LogoutResulted))];
  }
};

//
//
//
// Auth
//
//
//

export type LoginMethod = { type: "Google" };

const login =
  (method: LoginMethod): Task.Task<Result.Result<{}, {}>> =>
  async () => {
    switch (method.type) {
      case "Google":
        const { error } = await Supabase.client.auth.signIn({
          provider: "google",
        });

        if (error) {
          return Result.Err({});
        }

        return Result.Ok({});
    }
  };

const logout: Task.Task<Result.Result<{}, {}>> = async () => {
  const { error } = await Supabase.client.auth.signOut();

  if (error) {
    return Result.Err({});
  }

  return Result.Ok({});
};

const getSession: Task.Task<Msg> = async () => {
  const session = Supabase.client.auth.session();

  return fromSupabaseSession(session);
};

//
//
//
// Supscriptions
//
//
//

const subject = new Rx.Subject<Msg>();

Supabase.client.auth.onAuthStateChange((_, supabaseSession) => {
  const msg = fromSupabaseSession(supabaseSession);
  subject.next(msg);
});

export const subscriptions: Sub.Sub<Msg> = subject;

//
//
//
// Helper
//
//
//

export const fromSupabaseSession = (session: Supabase.Session | null): Msg => {
  const userId = session?.user?.id;

  const defaultName =
    session?.user?.user_metadata?.name ??
    session?.user?.user_metadata?.full_name ??
    "";

  if (userId) {
    return GotSession(Option.Some({ userId, defaultName }));
  }

  return GotSession(Option.None);
};
