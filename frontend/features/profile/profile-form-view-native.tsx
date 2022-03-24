import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import constate from "constate";
import * as React from "react";
import { useState } from "react";
import { Appbar, Avatar, Button, TextInput } from "react-native-paper";
import { spacing } from "../../ui/theme";
import {
  IAvatarSeed,
  IAvatarStyle,
  toAvatarSeed,
  toAvatarUrl,
} from "./profile-avatar-data";

export type IProfileFormValues = {
  username: string;
  name: string;
  avatarSeed: IAvatarSeed;
  avatarStyle: IAvatarStyle;
};

const useProfileForm = ({
  onSubmit,
  defaultValues,
  submitting,
}: {
  submitting: boolean;
  onSubmit: (values: IProfileFormValues) => void;
  defaultValues: IProfileFormValues;
}) => {
  const [name, setName] = useState(defaultValues.name);
  const [username, setUsername] = useState(defaultValues.username);
  const [avatarSeed, setAvatarSeed] = useState(defaultValues.avatarSeed);
  const [avatarStyle, setAvatarStyle] = useState(defaultValues.avatarStyle);

  const avatarUrl = toAvatarUrl({ avatarSeed, avatarStyle });

  return {
    submitting,
    onSubmit: () => {
      onSubmit({
        name,
        username,
        avatarSeed,
        avatarStyle,
      });
    },
    avatarUrl,
    name,
    setName,
    username,
    setUsername,
    avatarSeed,
    setAvatarSeed,
    avatarStyle,
    setAvatarStyle,
  };
};

const [ProfileFormContext, useProfileFormContext] = constate(useProfileForm);

type IStackParamList = {
  Profile: undefined;
  Avatar: undefined;
};

const Stack = createNativeStackNavigator<IStackParamList>();

export const ProfileFormView = ({
  defaultValues,
  onSubmit,
  submitting,
}: {
  submitting: boolean;
  onBack: () => void;
  defaultValues: IProfileFormValues;
  onSubmit: (values: IProfileFormValues) => void;
}) => {
  return (
    <ProfileFormContext
      submitting={submitting}
      onSubmit={onSubmit}
      defaultValues={defaultValues}
    >
      <Stack.Navigator>
        <Stack.Screen
          name="Profile"
          component={ProfileView}
          options={{
            header: () => (
              <Appbar.Header>
                <Appbar.Content title="Profile" />
              </Appbar.Header>
            ),
          }}
        />
        <Stack.Screen
          name="Avatar"
          component={AvatarView}
          options={{
            header: ({ navigation }) => (
              <Appbar.Header>
                <Appbar.BackAction onPress={navigation.goBack} />
                <Appbar.Content title="Avatar" />
              </Appbar.Header>
            ),
          }}
        />
      </Stack.Navigator>
    </ProfileFormContext>
  );
};

const ProfileAvatar = () => {
  const { avatarUrl } = useProfileFormContext();

  return (
    <Avatar.Image
      style={{
        marginLeft: "auto",
        marginRight: "auto",
        marginTop: spacing(2),
        marginBottom: spacing(1),
      }}
      size={144}
      source={{
        uri: avatarUrl,
      }}
    />
  );
};

const ProfileView = ({
  navigation,
}: NativeStackScreenProps<IStackParamList, "Profile">) => {
  const { submitting, username, setUsername, name, setName, onSubmit } =
    useProfileFormContext();

  return (
    <>
      <ProfileAvatar />

      <Button
        style={{ marginBottom: spacing(1) }}
        onPress={() => {
          navigation.navigate("Avatar");
        }}
      >
        Change Avatar
      </Button>

      <TextInput
        autoComplete="true"
        style={{ marginHorizontal: spacing(1), marginBottom: spacing(2) }}
        mode="outlined"
        label="Name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        autoComplete="true"
        style={{ marginHorizontal: spacing(1), marginBottom: spacing(2) }}
        mode="outlined"
        label="Username"
        value={username}
        onChangeText={setUsername}
      />

      <Button
        style={{ marginHorizontal: spacing(1) }}
        mode="contained"
        onPress={onSubmit}
        disabled={submitting}
        loading={submitting}
      >
        Create
      </Button>
    </>
  );
};

const AvatarView = () => {
  const { avatarSeed, setAvatarSeed } = useProfileFormContext();

  return (
    <>
      <ProfileAvatar />

      <TextInput
        autoComplete="true"
        style={{ marginHorizontal: spacing(1), marginBottom: spacing(2) }}
        mode="outlined"
        label="Avatar Seed"
        value={avatarSeed}
        onChangeText={(text) => setAvatarSeed(toAvatarSeed(text))}
      />

      <Button
        style={{ marginHorizontal: spacing(1), marginBottom: spacing(2) }}
        mode="contained"
        onPress={() => {
          setAvatarSeed(toAvatarSeed(String(Math.random())));
        }}
      >
        Generate Seed
      </Button>
    </>
  );
};
