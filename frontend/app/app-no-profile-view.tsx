import { createNativeStackNavigator } from "@react-navigation/native-stack";
import constate from "constate";
import * as React from "react";
import { ProfileCreateScreen } from "../features/profile/profile-create/profile-create-screen";

type IStackParamList = {
  ProfileCreate: undefined;
};

const Stack = createNativeStackNavigator<IStackParamList>();

const [StackContext, useStackContext] = constate(
  ({ userId, defaultName }: { userId: string; defaultName: string }) => {
    return {
      userId,
      defaultName,
    };
  }
);

export const AppNoProfileView = ({
  userId,
  defaultName,
}: {
  userId: string;
  defaultName: string;
}) => {
  return (
    <StackContext userId={userId} defaultName={defaultName}>
      <Stack.Navigator initialRouteName="ProfileCreate">
        <Stack.Screen
          name="ProfileCreate"
          options={{ headerShown: false }}
          component={ProfileCreateScreenContainer}
        />
      </Stack.Navigator>
    </StackContext>
  );
};

const ProfileCreateScreenContainer = () => {
  const { defaultName, userId } = useStackContext();

  return <ProfileCreateScreen defaultName={defaultName} userId={userId} />;
};
