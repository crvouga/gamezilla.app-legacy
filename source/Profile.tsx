import { cmd } from "elm-ts";
import { Sub } from "elm-ts/lib/Sub";
import { task, option } from "fp-ts";
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

export const fetch = <Msg,>(
  { userId }: { userId: string },
  onSuccess: (profile: Profile) => Msg,
  onFailure: () => Msg
): cmd.Cmd<Msg> => {
  return new Rx.Observable((subscriber) => {
    Supabase.client
      .from<definitions["profile"]>("profile")
      .select("*")
      .eq("id", userId)
      .single()
      .then((response) => {
        subscriber.next(
          task.of(
            option.of(
              option.fold(
                onFailure,
                onSuccess
              )(option.map(rowToProfile)(option.fromNullable(response.data)))
            )
          )
        );
      });
  });
};

export const subscription = ({ userId }: { userId: string }) => {
  return new Rx.Observable<Profile | null>((subscriber) => {
    const subscription = Supabase.client
      .from<definitions["profile"]>(`profile:id=eq.${userId}`)
      .on("INSERT", (payload) => {
        subscriber.next(rowToProfile(payload.new));
      })
      .on("UPDATE", (payload) => {
        subscriber.next(rowToProfile(payload.new));
      })
      .on("DELETE", () => {
        subscriber.next(null);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  });
};
