import { useState } from "react";
import { definitions, supabaseClient } from "../../../data-access";
import { IDataAccess } from "./profile-update-state";

export const dataAccess: IDataAccess = {
  update: async ({ userId, name, username, avatarUrl }) => {
    const { error } = await supabaseClient
      .from<definitions["profile"]>("profile")
      .update({
        avatar_url: avatarUrl,
        username: username,
        name: name,
      })
      .match({ id: userId });

    if (error) {
      return {
        type: "error",
      };
    }

    return {
      type: "success",
    };
  },
};

export const useProfileUpdateMutation = ({
  onSuccess,
}: {
  onSuccess?: () => void;
}) => {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "failed"
  >("idle");

  const mutate = async (
    userId: string,
    updates: {
      avatarUrl?: string;
      name?: string;
      username?: string;
    }
  ) => {
    setStatus("loading");

    const result = await dataAccess.update({
      userId,
      ...updates,
    });

    if (result.type === "error") {
      setStatus("failed");
      return;
    }

    if (result.type === "success") {
      setStatus("success");
      onSuccess?.();
      return;
    }
  };

  return {
    mutate,
    status,
  };
};
