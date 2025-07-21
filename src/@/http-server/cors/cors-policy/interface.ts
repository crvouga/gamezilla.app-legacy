export type ICorsPolicy = {
  /**
   * Update the response headers to include CORS headers.
   * @param response - The response to update.
   * @param request - The request that triggered the response.
   */
  map: (response: Response, request: Request) => Response
}
