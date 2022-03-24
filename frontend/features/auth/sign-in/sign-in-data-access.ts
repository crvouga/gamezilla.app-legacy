import * as AuthSession from "expo-auth-session";
import { supabaseClient, supabaseConfig } from "../../../data-access";
import { IDataAccess } from "./sign-in-logic";
import { Platform } from "react-native";

export const dataAccess: IDataAccess = {
  signIn: async (method) => {
    if (Platform.OS === "web") {
      await supabaseClient.auth.signIn({ provider: method.type });
      return;
    }

    //DOCS: docs.expo.dev/versions/latest/sdk/auth-session/#what--authexpoio--does-for-you

    const proxyRedirectUri = AuthSession.makeRedirectUri({
      useProxy: true,
    });

    //https://auth.expo.io
    const redirectUri = AuthSession.makeRedirectUri({ useProxy: false });

    console.log({ redirectUri, proxyRedirectUri });

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
