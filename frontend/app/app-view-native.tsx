import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as React from "react";
import {
  Appbar,
  Avatar,
  Button,
  List,
  Portal,
  TextInput,
} from "react-native-paper";
import { SignInView } from "../features/auth/sign-in/sign-in-view-native";
import { SignOutView } from "../features/auth/sign-out/sign-out-view-native";
import { toAvatarSeed } from "../features/profile/profile-avatar-data";
import {
  IProfileFormValues,
  ProfileFormView,
} from "../features/profile/profile-form-view-native";
import { useAppSelector } from "../main-store";
import { DialogLoading } from "../ui/DialogLoading";
import { spacing, ThemeProvider } from "../ui/ThemeProvider";

export const AppView = () => {
  const authState = useAppSelector((state) => state.auth.subscribe);

  return (
    <ThemeProvider>
      <Portal>
        <DialogLoading
          visible={authState.type === "loading"}
          title="Checking if logged in..."
        />
      </Portal>

      {authState.type === "signed-in" && (
        <SignedInView defaultName={authState.defaultName} />
      )}

      {authState.type === "signed-out" && (
        <>
          <SignInView />
        </>
      )}
    </ThemeProvider>
  );
};

const SignedInView = ({ defaultName }: { defaultName: string }) => {
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
        <ProfileNotFoundView defaultName={defaultName} />
      )}
    </>
  );
};

type ProfileNotFoundStackParamList = {
  CreateProfile: {
    defaultValues: IProfileFormValues;
  };
};

const ProfileNotFoundStack =
  createNativeStackNavigator<ProfileNotFoundStackParamList>();

const ProfileNotFoundView = ({ defaultName }: { defaultName: string }) => {
  return (
    <ProfileNotFoundStack.Navigator initialRouteName="CreateProfile">
      <ProfileNotFoundStack.Screen
        name="CreateProfile"
        options={{ headerShown: false }}
      >
        {() => {
          return (
            <ProfileFormView
              onSubmit={(values) => {
                console.log({ values });
              }}
              defaultValues={{
                name: defaultName,
                username: defaultName.replace(" ", "").toLocaleLowerCase(),
                avatarSeed: toAvatarSeed(defaultName),
                avatarStyle: "big-ears-neutral",
              }}
            />
          );
        }}
      </ProfileNotFoundStack.Screen>
    </ProfileNotFoundStack.Navigator>
  );
};

type RootStackParamList = {
  Home: undefined;
  Logout: undefined;
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
          onPress={() => {}}
          title="Game"
          left={() => <List.Icon icon="gamepad" />}
          right={() => <List.Icon icon="chevron-right" />}
        />
        <List.Item
          onPress={() => {}}
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
