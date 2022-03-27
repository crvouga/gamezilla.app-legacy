import { useReduxDevToolsExtension } from "@react-navigation/devtools";
import {
  NavigationContainer,
  useNavigationContainerRef,
} from "@react-navigation/native";
import AppLoading from "expo-app-loading";
import * as React from "react";
import { View } from "react-native";
import { Portal, Provider as PaperProvider } from "react-native-paper";
import { SignInView } from "../features/auth/sign-in/sign-in-view";
import { useAppSelector } from "../store";
import { darkTheme, DialogLoading, useFontState } from "../ui";
import { AppNoProfileView } from "./app-view-no-profile";
import { AppProfileView } from "./app-view-profile";
import { useWebStyles } from "./use-web-styles";

export const AppView = () => {
  const fontsState = useFontState();
  const authState = useAppSelector((state) => state.auth);

  useWebStyles({ backgroundColor: darkTheme.colors.background });

  const navigationRef = useNavigationContainerRef();

  useReduxDevToolsExtension(navigationRef);

  if (fontsState.type === "loading") {
    return <AppLoading />;
  }

  return (
    <PaperProvider theme={darkTheme}>
      <NavigationContainer ref={navigationRef} theme={darkTheme}>
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
  const profileState = useAppSelector((state) => state.profile);

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
