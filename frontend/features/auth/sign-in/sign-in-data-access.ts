import * as AuthSession from "expo-auth-session";
import { Platform } from "react-native";
import { supabaseClient, supabaseConfig } from "../../../data-access";

export type ISignInMethod = {
  type: "google";
};

export type IDataAccess = {
  signIn: (method: ISignInMethod) => Promise<void>;
};

export const dataAccess: IDataAccess = {
  signIn: async (method) => {
    if (Platform.OS === "web") {
      await supabaseClient.auth.signIn(
        {
          provider: method.type,
        },
        {
          redirectTo: window.location.origin,
        }
      );
      return;
    }

    //DOCS: docs.expo.dev/versions/latest/sdk/auth-session/#what--authexpoio--does-for-you

    const proxyRedirectUri = AuthSession.makeRedirectUri({
      useProxy: true,
    });

    //https://auth.expo.io
    const redirectUri = AuthSession.makeRedirectUri({ useProxy: false });

    const provider = method.type;

    const response = await AuthSession.startAsync({
      authUrl: `${supabaseConfig.url}/auth/v1/authorize?provider=${provider}&redirect_to=${proxyRedirectUri}`,
      returnUrl: redirectUri,
    });

    if (response.type === "success") {
      await supabaseClient.auth.signIn(
        {
          refreshToken: response.params.refresh_token,
        },
        {
          redirectTo: redirectUri,
        }
      );
      return;
    }
  },
};
