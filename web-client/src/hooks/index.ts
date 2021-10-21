import type { GetSession } from "@sveltejs/kit";

export const getSession: GetSession = async (request) => {
  return {
    authState: {
      status: "unautheniticated",
    },
  };
};
