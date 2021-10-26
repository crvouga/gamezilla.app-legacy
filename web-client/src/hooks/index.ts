import type { GetSession } from "@sveltejs/kit";

export const getSession: GetSession = async () => {
  return {
    authState: {
      status: "unautheniticated",
    },
  };
};
