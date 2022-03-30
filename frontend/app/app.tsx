import { NavigationProp, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as React from "react";
import { SignIn } from "../features/auth/sign-in/SignIn";
import { SignOut } from "../features/auth/sign-out/SignOut";
import { Home } from "../features/home/Home";
import { ProfileCreate } from "../features/profile/profile-create/ProfileCreate";
import { ProfileDelete } from "../features/profile/profile-delete/ProfileDelete";
import { ProfileUpdate } from "../features/profile/profile-update/ProfileUpdate";
import { Profile } from "../features/profile/Profile";
import { useSelector } from "../store";
import { DialogLoading, useTheme } from "../ui";

type IStackParamList = {
  Home: undefined;
  Profile: undefined;
  Game: undefined;
  ProfileUpdate: undefined;
  ProfileCreate: undefined;
  ProfileDelete: undefined;
  SignIn: undefined;
  SignOut: undefined;
  Loading: undefined;
};

export const Stack = createNativeStackNavigator<IStackParamList>();

export const App = () => {
  const state = useSelector((state) => state);
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp<IStackParamList>>();

  if (state.auth.type === "loading") {
    const LoadingScreen = () => {
      return <DialogLoading visible title={"Checking if logged in..."} />;
    };

    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="Loading"
          component={LoadingScreen}
          options={{ presentation: "containedTransparentModal" }}
        />
      </Stack.Navigator>
    );
  }

  if (state.auth.type === "signed-out") {
    const SignInScreen = () => {
      return <SignIn />;
    };

    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="SignIn" component={SignInScreen} />
      </Stack.Navigator>
    );
  }

  const { defaultName, userId } = state.auth;

  if (state.profile.type === "loading") {
    const LoadingScreen = () => {
      return <DialogLoading visible title={"Loading profile..."} />;
    };

    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="Loading"
          component={LoadingScreen}
          options={{ presentation: "containedTransparentModal" }}
        />
      </Stack.Navigator>
    );
  }

  if (state.profile.type === "not-found") {
    const ProfileCreateScreen = () => {
      return (
        <ProfileCreate
          onLogout={() => {
            navigation.navigate("SignOut");
          }}
          userId={userId}
          defaultName={defaultName}
        />
      );
    };

    const SignOutScreen = () => {
      return <SignOut onCancel={navigation.goBack} />;
    };

    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ProfileCreate" component={ProfileCreateScreen} />
        <Stack.Screen
          name="SignOut"
          component={SignOutScreen}
          options={{ presentation: "transparentModal" }}
        />
      </Stack.Navigator>
    );
  }

  const { profile } = state.profile;

  const ProfileUpdateScreen = () => {
    return <ProfileUpdate profile={profile} onCancel={navigation.goBack} />;
  };

  const ProfileScreen = () => {
    return (
      <Profile
        onBack={navigation.goBack}
        onDelete={() => {
          navigation.navigate("ProfileDelete");
        }}
        onUpdate={() => {
          navigation.navigate("ProfileUpdate");
        }}
        onSignOut={() => {
          navigation.navigate("SignOut");
        }}
      />
    );
  };

  const ProfileDeleteScreen = () => {
    return <ProfileDelete userId={userId} onCancel={navigation.goBack} />;
  };

  const SignOutScreen = () => {
    return <SignOut onCancel={navigation.goBack} />;
  };

  const HomeScreen = () => {
    return (
      <Home
        onProfile={() => navigation.navigate("Profile")}
        onGame={() => navigation.navigate("Home")}
      />
    );
  };

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="ProfileUpdate" component={ProfileUpdateScreen} />
      <Stack.Screen
        name="ProfileDelete"
        component={ProfileDeleteScreen}
        options={{ presentation: "containedTransparentModal" }}
      />
      <Stack.Screen
        name="SignOut"
        component={SignOutScreen}
        options={{ presentation: "containedTransparentModal" }}
      />
    </Stack.Navigator>
  );
};

const AppSignedOut = () => {
  const SignInScreen = () => {
    return <SignIn />;
  };

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SignIn" component={SignInScreen} />
    </Stack.Navigator>
  );
};
