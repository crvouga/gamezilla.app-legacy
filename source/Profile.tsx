import { pipe } from "fp-ts/lib/function";
import * as Option from "fp-ts/lib/Option";
import * as Task from "fp-ts/lib/Task";
import * as Rx from "rxjs";
import { cmd } from "./Framework";
import * as Supabase from "./Supabase";
import { definitions } from "./supabase-types";

export type Profile = {
  userId: string;
  username: string;
  name: string;
  avatarUrl: string;
};

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

export const subscription = ({ userId }: { userId: string }) => {
  return new Rx.Observable<Option.Option<Profile>>((subscriber) => {
    const subscription = Supabase.client
      .from<definitions["profile"]>(`profile:id=eq.${userId}`)
      .on("INSERT", (payload) => {
        subscriber.next(Option.some(rowToProfile(payload.new)));
      })
      .on("UPDATE", (payload) => {
        subscriber.next(Option.some(rowToProfile(payload.new)));
      })
      .on("DELETE", () => {
        subscriber.next(Option.none);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  });
};
