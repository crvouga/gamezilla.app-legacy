import { definitions, supabaseClient } from "src/supabase";
import { generateRandomAvatarUrl } from "./avatar";

export type IProfile = {
  userId: string;
  displayName?: string;
  avatarUrl?: string;
};

const fetch = async ({
  userId,
}: {
  userId: string;
}): Promise<IProfile | null> => {
  const response = await supabaseClient
    .from<definitions["profile"]>("profile")
    .select("*")
    .eq("id", userId)
    .single();

  if (response.data) {
    return {
      userId: response.data.id,
      avatarUrl: response.data.avatar_url,
      displayName: response.data.display_name,
    };
  }

  return null;
};

const create = async ({ userId }: { userId: string }) => {
  await supabaseClient.from<definitions["profile"]>("profile").insert({
    id: userId,
    avatar_url: generateRandomAvatarUrl(),
  });
};

const fetchElseCreate = async ({ userId }: { userId: string }) => {
  const fetched = await fetch({ userId });

  if (fetched) {
    return fetched;
  }

  await create({ userId });

  return fetch({ userId });
};

const update = async ({
  userId,
  displayName,
  avatarUrl,
}: {
  userId: string;
  displayName?: string;
  avatarUrl?: string;
}) => {
  await supabaseClient
    .from<definitions["profile"]>("profile")
    .update({
      display_name: displayName,
      avatar_url: avatarUrl,
    })
    .match({ id: userId });
};

type IProfileState =
  | {
      type: "loading";
    }
  | {
      type: "loaded";
      profile: IProfile;
    };

const subscribe = (
  {
    userId,
  }: {
    userId: string;
  },
  emit: (profile: IProfileState) => void
): (() => void) => {
  emit({
    type: "loading",
  });

  fetchElseCreate({ userId }).then((profile) => {
    if (profile) {
      emit({
        type: "loaded",
        profile,
      });
    }
  });

  const response = supabaseClient
    .from<definitions["profile"]>(`profile:id=eq.${userId}`)
    .on("*", (payload) => {
      emit({
        type: "loaded",
        profile: {
          userId: payload.new.id,
          avatarUrl: payload.new.avatar_url,
          displayName: payload.new.display_name,
        },
      });
    })
    .subscribe();

  return () => {
    response.unsubscribe();
  };
};

export const profileDataAccess = {
  subscribe,
  update,
};
