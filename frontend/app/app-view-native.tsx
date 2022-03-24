import { LinkingOptions, NavigationContainer } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import constate from "constate";
import AppLoading from "expo-app-loading";
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
import { SignOutButton } from "../features/auth/sign-out/sign-out-view-native";
import { ProfileCreateScreen } from "../features/profile/profile-create/profile-create-screen";
import { ProfileDeleteButton } from "../features/profile/profile-delete/profile-delete-view";
import { ProfileUpdateView } from "../features/profile/profile-update/profile-update-view";
import { useAppSelector } from "../main-store";
import { darkTheme, DialogLoading, spacing, useFontState } from "../ui";

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [],
  config: {
    screens: {
      Home: "home",
      Profile: "profile",
    },
  },
};

const [SignedInContext, useSignedInContext] = constate(
  (signedInState: { userId: string; defaultName: string }) => {
    return signedInState;
  }
);

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
            <SignedInContext
              userId={authState.userId}
              defaultName={authState.defaultName}
            >
              <SignedInView />
            </SignedInContext>
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

const SignedInView = () => {
  const profileState = useAppSelector((state) => state.profile.subscribe);

  return (
    <>
      <Portal>
        <DialogLoading
          visible={profileState.type === "loading"}
          title="Loading profile..."
        />
      </Portal>

      {profileState.type === "found" && (
        <ProfileFoundView profile={profileState.profile} />
      )}

      {profileState.type === "not-found" && <ProfileNotFoundView />}
    </>
  );
};

type ProfileNotFoundStackParamList = {
  CreateProfile: undefined;
};

const ProfileNotFoundStack =
  createNativeStackNavigator<ProfileNotFoundStackParamList>();

const ProfileNotFoundView = () => {
  return (
    <ProfileNotFoundStack.Navigator initialRouteName="CreateProfile">
      <ProfileNotFoundStack.Screen
        name="CreateProfile"
        options={{ headerShown: false }}
        component={MyProfileCreateScreen}
      />
    </ProfileNotFoundStack.Navigator>
  );
};

const MyProfileCreateScreen = () => {
  const { defaultName, userId } = useSignedInContext();

  return <ProfileCreateScreen defaultName={defaultName} userId={userId} />;
};

type RootStackParamList = {
  Home: undefined;
  Profile: undefined;
  Game: undefined;
  ProfileUpdate: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const ProfileFoundView = ({
  profile,
}: {
  profile: {
    userId: string;
    username?: string;
    name?: string;
    avatarUrl?: string;
  };
}) => {
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
        name="ProfileUpdate"
        options={{
          header: ({ navigation }) => {
            return (
              <Appbar.Header>
                <Appbar.BackAction
                  onPress={() => {
                    navigation.goBack();
                  }}
                />
                <Appbar.Content title="Edit Profile" />
              </Appbar.Header>
            );
          },
        }}
      >
        {() => {
          return <ProfileUpdateView profile={profile} />;
        }}
      </Stack.Screen>

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

const ProfileScreen = ({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "Home">) => {
  const { userId } = useSignedInContext();

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
        style={{ marginHorizontal: spacing(1), marginBottom: spacing(2) }}
      />

      <ProfileDeleteButton
        style={{ marginHorizontal: spacing(1) }}
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
