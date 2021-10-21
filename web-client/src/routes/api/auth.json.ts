import type { RequestHandler } from "@sveltejs/kit";

export const post: RequestHandler = async (req) => {
  return {
    status: 200,
    body: null,
  };
};
