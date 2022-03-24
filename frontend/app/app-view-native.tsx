import { LinkingOptions, NavigationContainer } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as React from "react";
import { View } from "react-native";
import {
  Appbar,
  List,
  Portal,
  Provider as PaperProvider,
} from "react-native-paper";
import { useAuthState } from "../features/auth/auth-state/use-auth-state";
import { SignInView } from "../features/auth/sign-in/sign-in-view-native";
import { SignOutView } from "../features/auth/sign-out/sign-out-view-native";
import { ProfileCreateScreen } from "../features/profile/profile-create/profile-create-screen";
import { useAppSelector } from "../main-store";
import { DialogLoading } from "../ui/DialogLoading";
import { useFontState } from "../ui/theme-fonts";
import { darkTheme } from "../ui/theme";

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [],
  config: {
    screens: {
      Home: "home",
      Profile: "profile",
    },
  },
};

import AppLoading from "expo-app-loading";

export const AppView = () => {
  const authState = useAuthState();
  const fontsState = useFontState();

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
              title="Checking if logged in..."
            />
          </Portal>

          {authState.type === "signed-in" && (
            <SignedInView
              userId={authState.userId}
              defaultName={authState.defaultName}
            />
          )}

          {authState.type === "signed-out" && (
            <>
              <SignInView />
            </>
          )}
        </View>
      </NavigationContainer>
    </PaperProvider>
  );
};

const SignedInView = ({
  userId,
  defaultName,
}: {
  userId: string;
  defaultName: string;
}) => {
  const profileState = useAppSelector((state) => state.profile.subscribe);

  return (
    <>
      <Portal>
        <DialogLoading
          visible={profileState.type === "loading"}
          title="Loading profile..."
        />
      </Portal>

      {profileState.type === "found" && <ProfileFoundView />}

      {profileState.type === "not-found" && (
        <ProfileNotFoundView userId={userId} defaultName={defaultName} />
      )}
    </>
  );
};

type ProfileNotFoundStackParamList = {
  CreateProfile: undefined;
  SignOut: undefined;
};

const ProfileNotFoundStack =
  createNativeStackNavigator<ProfileNotFoundStackParamList>();

const ProfileNotFoundView = ({
  defaultName,
  userId,
}: {
  defaultName: string;
  userId: string;
}) => {
  return (
    <ProfileNotFoundStack.Navigator initialRouteName="CreateProfile">
      <ProfileNotFoundStack.Screen
        name="CreateProfile"
        options={{ headerShown: false }}
      >
        {() => {
          return (
            <ProfileCreateScreen defaultName={defaultName} userId={userId} />
          );
        }}
      </ProfileNotFoundStack.Screen>
      <ProfileNotFoundStack.Screen
        name="SignOut"
        options={{ headerShown: false }}
        component={SignOutScreen}
      />
    </ProfileNotFoundStack.Navigator>
  );
};

const SignOutScreen = (
  props: NativeStackScreenProps<ProfileNotFoundStackParamList, "SignOut">
) => {
  return (
    <>
      <Appbar.Header>
        <Appbar.Content title="Sign Out" />
      </Appbar.Header>
    </>
  );
};

type RootStackParamList = {
  Home: undefined;
  Profile: undefined;
  Game: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const ProfileFoundView = () => {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          header: () => {
            return (
              <Appbar.Header>
                <Appbar.Content title="Home" />
              </Appbar.Header>
            );
          },
        }}
      />

      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          header: ({ navigation }) => {
            return (
              <Appbar.Header>
                <Appbar.BackAction
                  onPress={() => {
                    navigation.goBack();
                  }}
                />
                <Appbar.Content title="Profile" />
              </Appbar.Header>
            );
          },
        }}
      />

      <Stack.Screen
        name="Game"
        component={GameScreen}
        options={{
          header: ({ navigation }) => {
            return (
              <Appbar.Header>
                <Appbar.BackAction
                  onPress={() => {
                    navigation.goBack();
                  }}
                />
                <Appbar.Content title="Game" />
              </Appbar.Header>
            );
          },
        }}
      />
    </Stack.Navigator>
  );
};

const HomeScreen = ({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "Home">) => {
  const [state, setState] = React.useState<"idle" | "visible">("idle");
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
        <List.Item
          onPress={() => {
            setState("visible");
          }}
          title="Sign Out"
          left={() => <List.Icon icon="logout" />}
        />
      </List.Section>
      <SignOutView
        visible={state === "visible"}
        onCancel={() => {
          setState("idle");
        }}
      />
    </>
  );
};

const ProfileScreen = () => {
  return (
    <>
      <List.Section>
        <List.Item
          onPress={() => {}}
          title="Edit"
          left={() => <List.Icon icon="pencil" />}
          right={() => <List.Icon icon="chevron-right" />}
        />
        <List.Item
          title="Delete"
          left={() => <List.Icon icon="delete" />}
          right={() => <List.Icon icon="chevron-right" />}
        />
      </List.Section>
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
