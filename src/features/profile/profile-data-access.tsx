import { definitions, supabaseClient } from "../../third-party-services";
import { IProfile } from "./profile-data";

const getProfile = async ({
  userId,
}: {
  userId: string;
}): Promise<IProfile | null> => {
  const { data } = await supabaseClient
    .from<definitions["profile"]>("profile")
    .select("*")
    .eq("id", userId)
    .single();

  if (data) {
    return {
      userId: data.id,
      avatarUrl: data.avatar_url,
      username: data.username,
      name: data.name,
    };
  }

  return null;
};

export const createProfile = async ({
  userId,
  name,
  username,
  avatarUrl,
}: {
  userId: string;
  name: string;
  username: string;
  avatarUrl: string;
}): Promise<
  | {
      type: "success";
      profile: IProfile;
    }
  | {
      type: "error";
      error: Error;
    }
> => {
  const response = await supabaseClient
    .from<definitions["profile"]>("profile")
    .insert({
      id: userId,
      name,
      username,
      avatar_url: avatarUrl,
    })
    .single();

  if (response.data?.id) {
    return {
      type: "success",
      profile: {
        userId: response.data?.id,
        avatarUrl: response.data?.avatar_url,
        name: response.data?.name,
        username: response.data?.username,
      },
    };
  }

  return {
    type: "error",
    error: new Error(response.error?.message ?? "Failed to create profile"),
  };
};

export const deleteProfile = async ({ userId }: { userId: string }) => {
  await supabaseClient
    .from<definitions["profile"]>("profile")
    .delete()
    .match({ id: userId });
};

type IProfileStatus =
  | {
      type: "loading";
    }
  | {
      type: "found";
      profile: {
        userId: string;
        avatarUrl?: string;
        username?: string;
        name?: string;
      };
    }
  | {
      type: "not-found";
    };

export const onProfileStatus = ({ userId }: { userId: string }) => (
  set: (status: IProfileStatus) => void
) => {
  getProfile({ userId }).then((profile) => {
    if (profile) {
      set({
        type: "found",
        profile,
      });
      return;
    }
    set({ type: "not-found" });
  });

  const subscription = supabaseClient
    .from<definitions["profile"]>(`profile:id=eq.${userId}`)
    .on("INSERT", (payload) => {
      set({
        type: "found",
        profile: {
          userId: payload.new.id,
          avatarUrl: payload.new.avatar_url,
          username: payload.new.username,
          name: payload.new.name,
        },
      });
    })
    .on("UPDATE", (payload) => {
      set({
        type: "found",
        profile: {
          userId: payload.new.id,
          avatarUrl: payload.new.avatar_url,
          username: payload.new.username,
          name: payload.new.name,
        },
      });
    })
    .on("DELETE", () => {
      set({ type: "not-found" });
    })
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
};

export const updateProfile = async ({
  userId,
  avatarUrl,
  username,
  name,
}: {
  userId: string;
  avatarUrl?: string;
  username?: string;
  name?: string;
}) => {
  const { error } = await supabaseClient
    .from<definitions["profile"]>("profile")
    .update({
      avatar_url: avatarUrl,
      username: username,
      name: name,
    })
    .match({ id: userId });

  if (error) {
    throw error;
  }
};
