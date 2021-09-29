export const getEnvironment = (): "production" | "development" | null => {
  const environment = process.env.NODE_ENV;

  if (environment === "production" || environment === "development") {
    return environment;
  }

  return null;
};
