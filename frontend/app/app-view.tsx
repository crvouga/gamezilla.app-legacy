import { NavigationContainer } from "@react-navigation/native";
import AppLoading from "expo-app-loading";
import * as React from "react";
import { View } from "react-native";
import { Portal, Provider as PaperProvider } from "react-native-paper";
import { useAuthState } from "../features/auth/auth-state/use-auth-state";
import { SignInView } from "../features/auth/sign-in/sign-in-view";
import { useProfileState } from "../features/profile/profile-state/use-profile-state";
import { darkTheme, DialogLoading, useFontState } from "../ui";
import { AppNoProfileView } from "./app-no-profile-view";
import { AppProfileView } from "./app-profile-view";
import { useWebStyles } from "./use-web-styles";

export const AppView = () => {
  const fontsState = useFontState();
  const authState = useAuthState();

  useWebStyles({ backgroundColor: darkTheme.colors.background });

  if (fontsState.type === "loading") {
    return <AppLoading />;
  }

  return (
    <PaperProvider theme={darkTheme}>
      <NavigationContainer theme={darkTheme}>
        <View
          style={{
            flex: 1,
            backgroundColor: darkTheme.colors.background,
          }}
        >
          {authState.type === "loading" && (
            <Portal>
              <DialogLoading visible title={"Checking if logged in..."} />
            </Portal>
          )}

          {authState.type === "signed-out" && <SignInView />}

          {authState.type === "signed-in" && (
            <AppSignedInView
              userId={authState.userId}
              defaultName={authState.defaultName}
            />
          )}
        </View>
      </NavigationContainer>
    </PaperProvider>
  );
};

const AppSignedInView = ({
  userId,
  defaultName,
}: {
  userId: string;
  defaultName: string;
}) => {
  const profileState = useProfileState({ userId });

  return (
    <>
      <Portal>
        <DialogLoading
          visible={profileState.type === "loading"}
          title={"Loading profile..."}
        />
      </Portal>

      {profileState.type === "not-found" && (
        <AppNoProfileView userId={userId} defaultName={defaultName} />
      )}

      {profileState.type === "found" && (
        <AppProfileView profile={profileState.profile} />
      )}
    </>
  );
};
