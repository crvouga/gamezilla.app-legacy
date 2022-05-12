import { pipe } from "fp-ts/lib/function";
import * as Option from "fp-ts/lib/Option";
import * as Task from "fp-ts/lib/Task";
import * as Rx from "rxjs";
import { cmd, sub } from "./Framework";
import * as Supabase from "./Supabase";
import { definitions } from "./supabase-types";
import * as Page from "./Page";

//
//
//
// Model
//
//
//

export type Model =
  | {
      type: "Loading";
    }
  | {
      type: "Missing";
    }
  | {
      type: "Found";
      profile: Profile;
    };

export type Profile = {
  userId: string;
  username: string;
  name: string;
  avatarUrl: string;
};

export const init: Model = { type: "Loading" };

//
//
//
// Update
//
//
//

export type Msg = Missing | Found;

type Found = { group: "Profile"; type: "ProfileFound"; profile: Profile };
const Found = (profile: Profile): Msg => ({
  group: "Profile",
  type: "ProfileFound",
  profile,
});

type Missing = { group: "Profile"; type: "ProfileMissing" };
const Missing = (): Msg => ({ group: "Profile", type: "ProfileMissing" });

export const update = (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "ProfileFound":
      return [
        { type: "Found", profile: msg.profile },
        Page.navigate({ type: "Home" }),
      ];

    case "ProfileMissing":
      return [{ type: "Missing" }, cmd.none];
  }
};

//
//
//
//
//
//
//

const rowToProfile = (row: definitions["profile"]): Profile => {
  return {
    userId: row.id,
    avatarUrl: row.avatar_url,
    name: row.name,
    username: row.username,
  };
};

export const fetch = <Msg,>({
  userId,
  onSuccess,
  onFailure,
}: {
  userId: string;
  onSuccess: (profile: Profile) => Msg;
  onFailure: () => Msg;
}): cmd.Cmd<Msg> => {
  return pipe(
    async () =>
      Supabase.client
        .from<definitions["profile"]>("profile")
        .select("*")
        .eq("id", userId)
        .single(),

    Task.map(({ data }) =>
      Option.some(data ? onSuccess(rowToProfile(data)) : onFailure())
    ),

    Rx.of
  );
};

export const create = <Msg,>({
  userId,
  name,
  username,
  avatarUrl,
  onSuccess,
  onFailure,
}: {
  userId: string;
  name: string;
  username: string;
  avatarUrl: string;
  onSuccess: (profile: Profile) => Msg;
  onFailure: () => Msg;
}): cmd.Cmd<Msg> => {
  return pipe(
    async () =>
      Supabase.client
        .from<definitions["profile"]>("profile")
        .insert({
          id: userId,
          name,
          username,
          avatar_url: avatarUrl,
          theme_mode: "SYSTEM",
        })
        .single(),

    Task.map(({ data }) =>
      Option.some(data ? onSuccess(rowToProfile(data)) : onFailure)
    ),

    Rx.of
  );
};

export const remove = <Msg,>({
  userId,
  onSuccess,
  onFailure,
}: {
  userId: string;
  onSuccess: () => Msg;
  onFailure: () => Msg;
}): cmd.Cmd<Msg> => {
  return pipe(
    async () =>
      Supabase.client
        .from<definitions["profile"]>("profile")
        .delete()
        .match({ id: userId }),

    Task.map(({ data }) => Option.some(data ? onSuccess() : onFailure)),

    Rx.of
  );
};

export const edit = <Msg,>({
  userId,
  username,
  name,
  avatarUrl,
  onSuccess,
  onFailure,
}: {
  userId: string;
  username?: string;
  name?: string;
  avatarUrl?: string;
  onSuccess: () => Msg;
  onFailure: () => Msg;
}): cmd.Cmd<Msg> => {
  return pipe(
    async () =>
      Supabase.client
        .from<definitions["profile"]>("profile")
        .update({
          username,
          name,
          avatar_url: avatarUrl,
        })
        .match({ id: userId }),

    Task.map(({ data }) => Option.some(data ? onSuccess() : onFailure)),

    Rx.of
  );
};

export const subscriptions = (
  { userId }: { userId: string },
  model: Model
): sub.Sub<Msg> => {
  switch (model.type) {
    case "Found":
      return sub.none;

    case "Loading":
      return new Rx.Observable<Msg>((subscriber) => {
        Supabase.client
          .from<definitions["profile"]>("profile")
          .select("*")
          .eq("id", userId)
          .single()
          .then(({ data }) => {
            if (data) {
              subscriber.next(Found(rowToProfile(data)));
            }
          });
      });

    case "Missing":
      return sub.none;
  }
  return new Rx.Observable<Msg>((subscriber) => {
    // Supabase.client
    //   .from<definitions["profile"]>("profile")
    //   .select("*")
    //   .eq("id", userId)
    //   .single()
    //   .then(({ data }) => {
    //     if (data) {
    //       subscriber.next(Found(rowToProfile(data)));
    //     }
    //   });

    const subscription = Supabase.client
      .from<definitions["profile"]>(`profile:id=eq.${userId}`)
      .on("INSERT", (payload) => {
        subscriber.next(Found(rowToProfile(payload.new)));
      })
      .on("UPDATE", (payload) => {
        subscriber.next(Found(rowToProfile(payload.new)));
      })
      .on("DELETE", () => {
        subscriber.next(Missing());
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  });
};
