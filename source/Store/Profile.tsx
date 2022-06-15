import { either, option, task } from "fp-ts";
import * as Rx from "rxjs";
import { sub } from "../Framework";
import * as Supabase from "../Supabase";
import { definitions } from "../supabase-types";

export type Profile = {
  userId: string;
  username: string;
  name: string;
  avatarUrl: string;
  themeMode: ThemeMode;
};

export type ThemeMode = "Light" | "Dark" | "System";

//
//
//
//
//
//
//

const toThemeMode = (
  themeMode: definitions["profile"]["theme_mode"]
): ThemeMode => {
  switch (themeMode) {
    case "DARK":
      return "Dark";

    case "LIGHT":
      return "Light";

    case "SYSTEM":
      return "System";
  }
};

const fromThemeMode = (
  themeMode: ThemeMode
): definitions["profile"]["theme_mode"] => {
  switch (themeMode) {
    case "Dark":
      return "DARK";

    case "Light":
      return "LIGHT";

    case "System":
      return "SYSTEM";
  }
};

const rowToProfile = (row: definitions["profile"]): Profile => {
  return {
    userId: row.id,
    avatarUrl: row.avatar_url,
    name: row.name,
    username: row.username,
    themeMode: toThemeMode(row.theme_mode),
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

export const search =
  ({
    nameOrUsername,
  }: {
    nameOrUsername: string;
  }): task.Task<either.Either<{ message: string }, Profile[]>> =>
  async () => {
    const response = await Supabase.client
      .from<definitions["profile"]>("profile")
      .select("*")
      .ilike("name", `%${nameOrUsername}%`);

    if (response.error) {
      return either.left({ message: response.error.message });
    }

    const profiles = response.data.map(rowToProfile);

    return either.right(profiles);
  };

export const edit =
  ({
    userId,
    username,
    name,
    avatarUrl,
    themeMode,
  }: {
    userId: string;
    username?: string;
    name?: string;
    avatarUrl?: string;
    themeMode?: ThemeMode;
  }): task.Task<either.Either<{}, {}>> =>
  async () => {
    const response = await Supabase.client
      .from<definitions["profile"]>("profile")
      .update({
        username,
        name,
        avatar_url: avatarUrl,
        theme_mode: themeMode ? fromThemeMode(themeMode) : undefined,
      })
      .match({ id: userId });

    if (response.error) {
      return either.left({});
    }

    return either.right({});
  };

export const subscription = ({
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
      Supabase.client.removeSubscription(subscription);
      subscription.unsubscribe();
    };
  });
};
