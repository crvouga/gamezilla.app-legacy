import { NavigationProp, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as React from "react";
import { StyleSheet } from "react-native";
import { List } from "react-native-paper";
import {
  AppBarContent,
  AppBarHeader,
  Button,
  spacing,
  useTheme,
} from "../../ui";
import { ProfileDelete } from "./profile-delete/ProfileDelete";
import { ProfileUpdate } from "./profile-update/ProfileUpdate";
import { SignOut } from "./sign-out/SignOut";

const styles = StyleSheet.create({
  button: {
    marginHorizontal: spacing(2),
    marginBottom: spacing(2),
  },
});

type IStackParamList = {
  AccountIndex: undefined;
  SignOut: undefined;
  ProfileUpdate: undefined;
  ProfileDelete: undefined;
};

const Stack = createNativeStackNavigator<IStackParamList>();

const useLocalNavigation = () =>
  useNavigation<NavigationProp<IStackParamList>>();

export const Account = ({
  profile,
}: {
  profile: {
    username: string;
    name: string;
    avatarUrl: string;
    userId: string;
  };
}) => {
  const theme = useTheme();

  const AccountScreen = () => {
    const navigation = useLocalNavigation();
    return (
      <>
        <AppBarHeader>
          <AppBarContent title={profile.username} />
        </AppBarHeader>

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

        <Button
          style={styles.button}
          onPress={() => {
            navigation.navigate("SignOut");
          }}
          icon="logout"
          title="Sign Out"
          color={theme.colors.error}
          mode="outlined"
        />

        <Button
          style={styles.button}
          mode="outlined"
          onPress={() => {
            navigation.navigate("ProfileDelete");
          }}
          icon="delete"
          title="Delete Profile"
          color={theme.colors.error}
        />
      </>
    );
  };

  const ProfileUpdateScreen = () => {
    const navigation = useLocalNavigation();
    return (
      <ProfileUpdate
        onCancel={() => {
          navigation.goBack();
        }}
        onSuccess={() => {
          navigation.goBack();
        }}
        profile={profile}
      />
    );
  };

  const ProfileDeleteScreen = () => {
    const navigation = useLocalNavigation();
    return (
      <ProfileDelete onCancel={navigation.goBack} userId={profile.userId} />
    );
  };

  const SignOutScreen = () => {
    const navigation = useLocalNavigation();
    return <SignOut onCancel={navigation.goBack} />;
  };

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AccountIndex" component={AccountScreen} />
      <Stack.Screen
        name="ProfileUpdate"
        component={ProfileUpdateScreen}
        options={{ presentation: "containedTransparentModal" }}
      />
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
