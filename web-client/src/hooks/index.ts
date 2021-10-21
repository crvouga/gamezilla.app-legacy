import { dataAccess } from "$lib/data-access";
import { toExpressRequest } from "$lib/utility/sveltekit-express";
import type { GetSession } from "@sveltejs/kit";

export const getSession: GetSession = async (request) => {
  const result = await dataAccess._supabaseClient.auth.api.getUserByCookie(
    request
  );

  console.log({ token: request.headers.token, request });

  return {
    authState: {
      status: "unautheniticated",
    },
  };
};
