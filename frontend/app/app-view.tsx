import { NavigationContainer } from "@react-navigation/native";
import AppLoading from "expo-app-loading";
import * as React from "react";
import { View } from "react-native";
import { Portal, Provider as PaperProvider } from "react-native-paper";
import { useAuthState } from "../features/auth/auth-state/use-auth-state";
import { SignInView } from "../features/auth/sign-in/sign-in-view";
import { useAppSelector } from "../main-store";
import { darkTheme, DialogLoading, useFontState } from "../ui";
import { AppNoProfileView } from "./app-no-profile-view";
import { AppProfileView } from "./app-profile-view";
import { useWebStyles } from "./use-web-styles";

export const AppView = () => {
  const authState = useAuthState();
  const fontsState = useFontState();
  const profileState = useAppSelector((state) => state.profile.subscribe);

  useWebStyles({ backgroundColor: darkTheme.colors.background });

  if (fontsState.type === "loading") {
    return <AppLoading />;
  }

  return (
    <PaperProvider theme={darkTheme}>
      <NavigationContainer theme={darkTheme}>
        <View
          style={{
            backgroundColor: darkTheme.colors.background,
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          <Portal>
            <DialogLoading
              visible={authState.type === "loading"}
              title={"Checking if logged in..."}
            />
          </Portal>

          {authState.type === "signed-out" && (
            <>
              <SignInView />
            </>
          )}

          {authState.type === "signed-in" && (
            <>
              <Portal>
                <DialogLoading
                  visible={profileState.type === "loading"}
                  title={"Loading profile..."}
                />
              </Portal>

              {profileState.type === "found" && (
                <AppProfileView profile={profileState.profile} />
              )}

              {profileState.type === "not-found" && (
                <AppNoProfileView
                  userId={authState.userId}
                  defaultName={authState.defaultName}
                />
              )}
            </>
          )}
        </View>
      </NavigationContainer>
    </PaperProvider>
  );
};
