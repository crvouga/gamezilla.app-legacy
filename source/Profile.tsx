import { cmd } from "elm-ts";
import { Sub } from "elm-ts/lib/Sub";
import * as Task from "fp-ts/lib/Task";
import * as Option from "fp-ts/lib/Option";
import { flow, pipe } from "fp-ts/lib/function";
import * as Rx from "rxjs";
import * as Supabase from "./Supabase";
import { definitions } from "./supabase-types";

/* 


Model


*/

export type Profile = {
  userId: string;
  username: string;
  name: string;
  avatarUrl: string;
};

/* 


Subscriptions


*/

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
    Task.map(
      flow(
        (response) => response.data,
        Option.fromNullable,
        Option.map(rowToProfile),
        Option.fold(onFailure, onSuccess),
        Option.of
      )
    ),
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
