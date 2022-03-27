import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as React from "react";
import { View } from "react-native";
import { Appbar, List, Portal, useTheme } from "react-native-paper";
import { SignInView } from "../features/auth/sign-in/sign-in-view";
import { SignOutButton } from "../features/auth/sign-out/sign-out-view-native";
import { ProfileCreateView } from "../features/profile/profile-create/profile-create-view";
import { ProfileDeleteButton } from "../features/profile/profile-delete/profile-delete-view";
import { IProfile } from "../features/profile/profile-state/profile-state";
import { ProfileUpdateView } from "../features/profile/profile-update/profile-update-view";
import { useAppSelector } from "../store";
import { DialogLoading, spacing } from "../ui";

type StackParamList = {
  Home: undefined;
  Profile: undefined;
  Game: undefined;
  ProfileUpdate: undefined;
  ProfileCreate: undefined;
  SignIn: undefined;
  Loading: undefined;
};

const Stack = createNativeStackNavigator<StackParamList>();

export const AppView = () => {
  const authState = useAppSelector((state) => state.auth);
  const profileState = useAppSelector((state) => state.profile);

  if (authState.type === "loading") {
    return (
      <Portal>
        <DialogLoading visible title={"Checking if logged in..."} />
      </Portal>
    );
  }

  if (authState.type !== "signed-out" && profileState.type === "loading") {
    return (
      <Portal>
        <DialogLoading visible title={"Loading profile..."} />
      </Portal>
    );
  }

  return (
    <Stack.Navigator>
      {authState.type === "signed-out" && (
        <Stack.Group>
          <Stack.Screen name="SignIn" component={SignInView} />
        </Stack.Group>
      )}

      {authState.type === "signed-in" && (
        <>
          {profileState.type === "not-found" && (
            <Stack.Group>
              <Stack.Screen
                name="ProfileCreate"
                component={ProfileCreateScreen(authState)}
              />
            </Stack.Group>
          )}

          {profileState.type === "found" && (
            <Stack.Group>
              <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{ header: HomeScreenHeader }}
              />
              <Stack.Screen
                name="Profile"
                component={ProfileScreen(authState)}
              />
              <Stack.Screen
                name="ProfileUpdate"
                component={ProfileUpdateScreen(profileState)}
              />
              <Stack.Screen name="Game" component={GameScreen} />
            </Stack.Group>
          )}
        </>
      )}
    </Stack.Navigator>
  );
};

const ProfileUpdateScreen =
  ({ profile }: { profile: IProfile }) =>
  () => {
    return <ProfileUpdateView profile={profile} />;
  };

const ProfileCreateScreen =
  ({ userId, defaultName }: { userId: string; defaultName: string }) =>
  () => {
    return <ProfileCreateView defaultName={defaultName} userId={userId} />;
  };

const HomeScreenHeader = () => {
  return (
    <Appbar.Header>
      <Appbar.Content title="Home" />
    </Appbar.Header>
  );
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
