import { useReduxDevToolsExtension } from "@react-navigation/devtools";
import {
  NavigationContainer,
  useNavigationContainerRef,
} from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AppLoading from "expo-app-loading";
import * as React from "react";
import { View } from "react-native";
import {
  Appbar,
  List,
  Portal,
  Provider as PaperProvider,
} from "react-native-paper";
import { SignInView } from "../features/auth/sign-in/sign-in-view";
import { SignOutButton } from "../features/auth/sign-out/sign-out-view-native";
import { ProfileCreateView } from "../features/profile/profile-create/profile-create-view";
import { ProfileDeleteButton } from "../features/profile/profile-delete/profile-delete-view";
import { ProfileUpdateView } from "../features/profile/profile-update/profile-update-view";
import { useAppSelector } from "../store";
import { darkTheme, DialogLoading, spacing, useFontState } from "../ui";

import { useWebStyles } from "./use-web-styles";

type StackParamList = {
  Home: undefined;
  Profile: undefined;
  Game: undefined;
  ProfileUpdate: undefined;
  ProfileCreate: undefined;
  SignIn: undefined;
};

const Stack = createNativeStackNavigator<StackParamList>();

export const AppView = () => {
  const fontsState = useFontState();
  const authState = useAppSelector((state) => state.auth);
  const profileState = useAppSelector((state) => state.profile);

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
          <Portal>
            <DialogLoading
              visible={authState.type === "loading"}
              title={"Checking if logged in..."}
            />
          </Portal>

          {authState.type === "signed-out" && (
            <Stack.Navigator>
              <Stack.Screen name="SignIn" component={SignInView} />
            </Stack.Navigator>
          )}

          {authState.type === "signed-in" && (
            <>
              <Portal>
                <DialogLoading
                  visible={profileState.type === "loading"}
                  title={"Loading profile..."}
                />
              </Portal>

              {profileState.type === "not-found" && (
                <Stack.Navigator>
                  <Stack.Screen
                    name="ProfileCreate"
                    getComponent={() => ProfileCreateScreen(authState)}
                  />
                </Stack.Navigator>
              )}

              {profileState.type === "found" && (
                <Stack.Navigator>
                  <Stack.Screen name="Home" component={HomeScreen} />
                  <Stack.Screen
                    name="Profile"
                    getComponent={() => ProfileScreen(authState)}
                  />
                  <Stack.Screen
                    name="ProfileUpdate"
                    component={ProfileUpdateView}
                  />
                  <Stack.Screen name="Game" component={GameScreen} />
                </Stack.Navigator>
              )}
            </>
          )}
        </View>
      </NavigationContainer>
    </PaperProvider>
  );
};

const ProfileCreateScreen =
  ({ userId, defaultName }: { userId: string; defaultName: string }) =>
  () => {
    return <ProfileCreateView defaultName={defaultName} userId={userId} />;
  };

const HomeScreen = ({
  navigation,
}: NativeStackScreenProps<StackParamList, "Home">) => {
  return (
    <>
      <List.Section>
        <List.Item
          onPress={() => {
            navigation.navigate("Game");
          }}
          title="Game"
          left={() => <List.Icon icon="gamepad" />}
          right={() => <List.Icon icon="chevron-right" />}
        />
        <List.Item
          onPress={() => {
            navigation.navigate("Profile");
          }}
          title="Profile"
          left={() => <List.Icon icon="account" />}
          right={() => <List.Icon icon="chevron-right" />}
        />
      </List.Section>
    </>
  );
};

const ProfileScreen =
  ({ userId }: { userId: string }) =>
  ({ navigation }: NativeStackScreenProps<StackParamList, "Home">) => {
    return (
      <>
        <List.Section>
          <List.Item
            onPress={() => {
              navigation.navigate("ProfileUpdate");
            }}
            title="Edit"
            left={() => <List.Icon icon="pencil" />}
            right={() => <List.Icon icon="chevron-right" />}
          />
        </List.Section>

        <SignOutButton
          style={{
            marginHorizontal: spacing(1),
            marginBottom: spacing(2),
          }}
        />

        <ProfileDeleteButton
          style={{
            marginHorizontal: spacing(1),
          }}
          userId={userId}
        />
      </>
    );
  };

const GameScreen = () => {
  return (
    <>
      <List.Section>
        <List.Item
          onPress={() => {}}
          title="Create"
          left={() => <List.Icon icon="pencil" />}
          right={() => <List.Icon icon="chevron-right" />}
        />
        <List.Item
          onPress={() => {}}
          title="Join"
          left={() => <List.Icon icon="magnify" />}
          right={() => <List.Icon icon="chevron-right" />}
        />
      </List.Section>
    </>
  );
};
