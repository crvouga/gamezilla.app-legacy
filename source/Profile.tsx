import { either, option, task } from "fp-ts";
import * as Rx from "rxjs";
import { pipe } from "fp-ts/lib/function";
import { cmd, sub } from "./Framework";
import * as Supabase from "./Supabase";
import { definitions } from "./supabase-types";

export type Profile = {
  userId: string;
  username: string;
  name: string;
  avatarUrl: string;
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

export const load =
  ({ userId }: { userId: string }): task.Task<either.Either<Error, Profile>> =>
  async () => {
    const response = await Supabase.client
      .from<definitions["profile"]>("profile")
      .select("*")
      .eq("id", userId)
      .single();

    if (response.error) {
      return either.left(new Error(response.error.message));
    }

    return either.right(rowToProfile(response.data));
  };

export const create =
  ({
    userId,
    name,
    username,
    avatarUrl,
  }: {
    userId: string;
    name: string;
    username: string;
    avatarUrl: string;
  }): task.Task<either.Either<{}, Profile>> =>
  async () => {
    const response = await Supabase.client
      .from<definitions["profile"]>("profile")
      .insert({
        id: userId,
        name,
        username,
        avatar_url: avatarUrl,
        theme_mode: "SYSTEM",
      })
      .single();

    if (response.data) {
      return either.right(rowToProfile(response.data));
    }

    return either.left({});
  };

export const deleteForever =
  <Msg,>({ userId }: { userId: string }): task.Task<either.Either<{}, {}>> =>
  async () => {
    const response = await Supabase.client
      .from<definitions["profile"]>("profile")
      .delete()
      .match({ id: userId });

    if (response.error) {
      return either.left({});
    }

    return either.right({});
  };

export const edit =
  ({
    userId,
    username,
    name,
    avatarUrl,
  }: {
    userId: string;
    username?: string;
    name?: string;
    avatarUrl?: string;
  }): task.Task<either.Either<{}, {}>> =>
  async () => {
    const response = await Supabase.client
      .from<definitions["profile"]>("profile")
      .update({
        username,
        name,
        avatar_url: avatarUrl,
      })
      .match({ id: userId });

    if (response.error) {
      return either.left({});
    }

    return either.right({});
  };

export const subscribe = ({
  userId,
}: {
  userId: string;
}): sub.Sub<option.Option<Profile>> => {
  return new Rx.Observable<option.Option<Profile>>((subscriber) => {
    const subscription = Supabase.client
      .from<definitions["profile"]>(`profile:id=eq.${userId}`)
      .on("INSERT", (payload) => {
        subscriber.next(option.some(rowToProfile(payload.new)));
      })
      .on("UPDATE", (payload) => {
        subscriber.next(option.some(rowToProfile(payload.new)));
      })
      .on("DELETE", () => {
        subscriber.next(option.none);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  });
};
